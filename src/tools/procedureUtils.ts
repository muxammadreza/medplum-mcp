import { ensureAuthenticated, medplum } from '../config/medplumClient';
import { CodeableConcept, Encounter, Patient, Practitioner, Procedure, Reference } from '@medplum/fhirtypes';

type ProcedurePerformerEntry = NonNullable<Procedure['performer']>[number];

export interface CreateProcedureArgs {
  status: Procedure['status'];
  code: CodeableConcept;
  subjectId?: string;
  subject?: Reference<Patient>;
  encounterId?: string;
  performedDateTime?: string;
  performerIds?: string[];
  reasonCode?: CodeableConcept[];
  bodySite?: CodeableConcept[];
  note?: string;
}

export interface UpdateProcedureArgs {
  status?: Procedure['status'];
  code?: CodeableConcept;
  subjectId?: string | null;
  encounterId?: string | null;
  performedDateTime?: string | null;
  performerIds?: string[] | null;
  reasonCode?: CodeableConcept[] | null;
  bodySite?: CodeableConcept[] | null;
  note?: string | null;
}

export interface ProcedureSearchArgs {
  patientId?: string;
  subject?: string;
  code?: string;
  status?: Procedure['status'];
  date?: string;
  encounterId?: string;
  performer?: string;
}

export async function createProcedure(args: CreateProcedureArgs): Promise<Procedure> {
  await ensureAuthenticated();

  const subject =
    args.subject ?? (args.subjectId ? { reference: `Patient/${args.subjectId}` } : undefined);

  if (!subject?.reference) {
    throw new Error('Patient reference is required to create a procedure.');
  }
  if (!args.status) {
    throw new Error('Procedure status is required.');
  }
  if (!args.code || !args.code.coding || args.code.coding.length === 0) {
    throw new Error('Procedure code with at least one coding is required.');
  }

  const procedure: Procedure = {
    resourceType: 'Procedure',
    status: args.status,
    code: args.code,
    subject,
    encounter: args.encounterId ? ({ reference: `Encounter/${args.encounterId}` } as Reference<Encounter>) : undefined,
    performedDateTime: args.performedDateTime,
    performer: args.performerIds?.map(
      (id) => ({ actor: { reference: `Practitioner/${id}` } }) as ProcedurePerformerEntry,
    ),
    reasonCode: args.reasonCode,
    bodySite: args.bodySite,
    note: args.note ? [{ text: args.note }] : undefined,
  };

  return medplum.createResource<Procedure>(procedure);
}

export async function getProcedureById(procedureId: string): Promise<Procedure | null> {
  await ensureAuthenticated();
  if (!procedureId) {
    throw new Error('Procedure ID is required.');
  }
  try {
    return await medplum.readResource('Procedure', procedureId);
  } catch (error: any) {
    if (error.outcome?.issue?.[0]?.code === 'not-found') {
      return null;
    }
    throw error;
  }
}

export async function updateProcedure(
  procedureId: string,
  updates: UpdateProcedureArgs,
): Promise<Procedure> {
  await ensureAuthenticated();

  if (!procedureId) {
    throw new Error('Procedure ID is required for update.');
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Updates are required for Procedure.');
  }

  const existing = await medplum.readResource('Procedure', procedureId);

  const {
    subjectId,
    encounterId,
    performerIds,
    note,
    ...rest
  } = updates;

  const updated: Procedure = {
    ...(existing as Procedure),
    ...(rest as Partial<Procedure>),
    id: procedureId,
    resourceType: 'Procedure',
  };

  if (subjectId) {
    updated.subject = { reference: `Patient/${subjectId}` };
  }

  if (encounterId === null) {
    delete updated.encounter;
  } else if (encounterId) {
    updated.encounter = { reference: `Encounter/${encounterId}` };
  }

  if (performerIds) {
    updated.performer = performerIds.map(
      (id) => ({ actor: { reference: `Practitioner/${id}` } }) as ProcedurePerformerEntry,
    );
  } else if (performerIds === null) {
    delete updated.performer;
  }

  if (note === null) {
    delete updated.note;
  } else if (note !== undefined) {
    updated.note = [{ text: note }];
  }

  return medplum.updateResource(updated);
}

export async function searchProcedures(args: ProcedureSearchArgs): Promise<Procedure[]> {
  await ensureAuthenticated();
  const criteria: string[] = [];

  const patientRef = args.subject || args.patientId;
  if (patientRef) {
    criteria.push(`patient=${patientRef.startsWith('Patient/') ? patientRef : `Patient/${patientRef}`}`);
  }
  if (args.code) {
    criteria.push(`code=${args.code}`);
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
  if (args.performer) {
    criteria.push(`performer=${args.performer}`);
  }

  if (criteria.length === 0) {
    return [];
  }

  const query = criteria.join('&');
  return medplum.searchResources('Procedure', query);
}
