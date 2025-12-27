import { ensureAuthenticated, medplum } from '../config/medplumClient';
import {
  CodeableConcept,
  DiagnosticReport,
  Encounter,
  Observation,
  Patient,
  Practitioner,
  Reference,
} from '@medplum/fhirtypes';

export interface CreateDiagnosticReportArgs {
  status: DiagnosticReport['status'];
  code: CodeableConcept;
  subjectId?: string;
  subject?: Reference<Patient>;
  encounterId?: string;
  effectiveDateTime?: string;
  conclusion?: string;
  performerIds?: string[];
  resultIds?: string[];
  presentedForm?: DiagnosticReport['presentedForm'];
}

export interface UpdateDiagnosticReportArgs {
  status?: DiagnosticReport['status'];
  code?: CodeableConcept;
  subjectId?: string | null;
  encounterId?: string | null;
  effectiveDateTime?: string | null;
  conclusion?: string | null;
  performerIds?: string[] | null;
  resultIds?: string[] | null;
  presentedForm?: DiagnosticReport['presentedForm'] | null;
}

export interface DiagnosticReportSearchArgs {
  patientId?: string;
  subject?: string;
  code?: string;
  category?: string;
  status?: DiagnosticReport['status'];
  date?: string;
  encounterId?: string;
}

export async function createDiagnosticReport(
  args: CreateDiagnosticReportArgs,
): Promise<DiagnosticReport> {
  await ensureAuthenticated();

  const subject =
    args.subject ?? (args.subjectId ? { reference: `Patient/${args.subjectId}` } : undefined);

  if (!subject?.reference) {
    throw new Error('Patient reference is required to create a diagnostic report.');
  }
  if (!args.status) {
    throw new Error('DiagnosticReport status is required.');
  }
  if (!args.code || !args.code.coding || args.code.coding.length === 0) {
    throw new Error('DiagnosticReport code with at least one coding is required.');
  }

  const report: DiagnosticReport = {
    resourceType: 'DiagnosticReport',
    status: args.status,
    code: args.code,
    subject,
    effectiveDateTime: args.effectiveDateTime,
    encounter: args.encounterId ? ({ reference: `Encounter/${args.encounterId}` } as Reference<Encounter>) : undefined,
    conclusion: args.conclusion,
    presentedForm: args.presentedForm,
    performer: args.performerIds?.map(
      (id) => ({ reference: `Practitioner/${id}` }) as Reference<Practitioner>,
    ),
    result: args.resultIds?.map(
      (id) => ({ reference: `Observation/${id}` }) as Reference<Observation>,
    ),
  };

  return medplum.createResource<DiagnosticReport>(report);
}

export async function getDiagnosticReportById(
  diagnosticReportId: string,
): Promise<DiagnosticReport | null> {
  await ensureAuthenticated();
  if (!diagnosticReportId) {
    throw new Error('DiagnosticReport ID is required.');
  }
  try {
    return await medplum.readResource('DiagnosticReport', diagnosticReportId);
  } catch (error: any) {
    if (error.outcome?.issue?.[0]?.code === 'not-found') {
      return null;
    }
    throw error;
  }
}

export async function updateDiagnosticReport(
  diagnosticReportId: string,
  updates: UpdateDiagnosticReportArgs,
): Promise<DiagnosticReport> {
  await ensureAuthenticated();

  if (!diagnosticReportId) {
    throw new Error('DiagnosticReport ID is required for update.');
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Updates are required for DiagnosticReport.');
  }

  const existing = await medplum.readResource('DiagnosticReport', diagnosticReportId);

  const {
    subjectId,
    encounterId,
    performerIds,
    resultIds,
    presentedForm,
    ...rest
  } = updates;

  const updated: DiagnosticReport = {
    ...(existing as DiagnosticReport),
    ...(rest as Partial<DiagnosticReport>),
    id: diagnosticReportId,
    resourceType: 'DiagnosticReport',
  };

  if (subjectId === null) {
    delete (updated as any).subject;
  } else if (subjectId) {
    updated.subject = { reference: `Patient/${subjectId}` };
  }

  if (encounterId === null) {
    delete updated.encounter;
  } else if (encounterId) {
    updated.encounter = { reference: `Encounter/${encounterId}` };
  }

  if (performerIds) {
    updated.performer = performerIds.map(
      (id) => ({ reference: `Practitioner/${id}` }) as Reference<Practitioner>,
    );
  } else if (performerIds === null) {
    delete updated.performer;
  }

  if (resultIds) {
    updated.result = resultIds.map(
      (id) => ({ reference: `Observation/${id}` }) as Reference<Observation>,
    );
  } else if (resultIds === null) {
    delete updated.result;
  }

  if (presentedForm === null) {
    delete updated.presentedForm;
  } else if (presentedForm !== undefined) {
    updated.presentedForm = presentedForm;
  }

  return medplum.updateResource(updated);
}

export async function searchDiagnosticReports(
  args: DiagnosticReportSearchArgs,
): Promise<DiagnosticReport[]> {
  await ensureAuthenticated();
  const criteria: string[] = [];

  const patientRef = args.subject || args.patientId;
  if (patientRef) {
    criteria.push(`patient=${patientRef.startsWith('Patient/') ? patientRef : `Patient/${patientRef}`}`);
  }
  if (args.code) {
    criteria.push(`code=${args.code}`);
  }
  if (args.category) {
    criteria.push(`category=${args.category}`);
  }
  if (args.status) {
    criteria.push(`status=${args.status}`);
  }
  if (args.date) {
    criteria.push(`date=${args.date}`);
  }
  if (args.encounterId) {
    criteria.push(`encounter=${args.encounterId}`);
  }

  if (criteria.length === 0) {
    return [];
  }

  const query = criteria.join('&');
  return medplum.searchResources('DiagnosticReport', query);
}
