import { medplum, ensureAuthenticated } from '../config/medplumClient';
import {
  Observation,
  Patient,
  Practitioner,
  Encounter,
  Reference,
  Identifier,
  CodeableConcept,
  Period,
  Quantity,
  Ratio,
  SampledData,
  Range,
  Annotation,
} from '@medplum/fhirtypes';

// Interface for creating an Observation
export interface CreateObservationArgs {
  status: Observation['status'];
  code: CodeableConcept;
  subject?: Reference<Patient>;
  subjectId?: string;
  encounter?: Reference<Encounter>;
  encounterId?: string;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference<Practitioner>[];
  performerIds?: string[];
  valueQuantity?: Quantity;
  valueString?: string;
  valueBoolean?: boolean;
  valueCodeableConcept?: CodeableConcept;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: SampledData;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: Period;
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  component?: Observation['component'];
  interpretation?: CodeableConcept[];
  note?: string;
  referenceRange?: Observation['referenceRange'];
  identifier?: { system?: string; value: string };
}

// Interface for retrieving an Observation by ID
export interface GetObservationByIdArgs {
  observationId: string;
}

// Interface for updating an Observation
export interface UpdateObservationArgs {
  status?: Observation['status'];
  code?: CodeableConcept;
  subjectId?: string;
  encounterId?: string | null;
  effectiveDateTime?: string | null;
  effectivePeriod?: Period | null;
  issued?: string;
  performerIds?: string[] | null;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: SampledData;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: Period;
  bodySite?: CodeableConcept | null;
  method?: CodeableConcept | null;
  referenceRange?: Observation['referenceRange'] | null;
  note?: string | null;
  interpretation?: CodeableConcept[] | null;
  identifier?: { system?: string; value: string } | null;
}

// Interface for searching Observations
export interface ObservationSearchArgs {
  patientId?: string;
  code?: string;
  codeSystem?: string;
  encounterId?: string;
  date?: string;
  status?: Observation['status'];
  subject?: string;
  performer?: string;
  identifier?: string;
  _lastUpdated?: string;
}

export async function createObservation(args: CreateObservationArgs): Promise<Observation> {
  await ensureAuthenticated();

  let subject = args.subject;
  if (args.subjectId && !subject) {
    subject = { reference: `Patient/${args.subjectId}` };
  }

  let encounter = args.encounter;
  if (args.encounterId && !encounter) {
    encounter = { reference: `Encounter/${args.encounterId}` };
  }

  let performer = args.performer;
  if (args.performerIds && !performer) {
    performer = args.performerIds.map((id) => ({ reference: `Practitioner/${id}` }));
  }

  if (!subject?.reference) {
    throw new Error('Patient reference is required to create an observation.');
  }
  if (!args.code || !args.code.coding || args.code.coding.length === 0) {
    throw new Error('Observation code with at least one coding is required.');
  }
  if (!args.status) {
    throw new Error('Observation status is required.');
  }
  if (
    args.valueQuantity === undefined &&
    args.valueCodeableConcept === undefined &&
    args.valueString === undefined &&
    args.valueBoolean === undefined &&
    args.valueInteger === undefined &&
    args.valueRange === undefined &&
    args.valueRatio === undefined &&
    args.valueSampledData === undefined &&
    args.valueTime === undefined &&
    args.valueDateTime === undefined &&
    args.valuePeriod === undefined
  ) {
    throw new Error(
      'At least one value field must be provided (valueQuantity, valueCodeableConcept, valueString, valueBoolean, valueInteger, valueRange, valueRatio, valueSampledData, valueTime, valueDateTime, or valuePeriod).',
    );
  }

  const observationResource: Observation = {
    resourceType: 'Observation',
    status: args.status,
    code: args.code,
    subject: subject,
    encounter: encounter,
    effectiveDateTime: args.effectiveDateTime,
    effectivePeriod: args.effectivePeriod,
    issued: args.issued || new Date().toISOString(),
    performer: performer,
    valueQuantity: args.valueQuantity,
    valueCodeableConcept: args.valueCodeableConcept,
    valueString: args.valueString,
    valueBoolean: args.valueBoolean,
    valueInteger: args.valueInteger,
    valueRange: args.valueRange,
    valueRatio: args.valueRatio,
    valueSampledData: args.valueSampledData,
    valueTime: args.valueTime,
    valueDateTime: args.valueDateTime,
    valuePeriod: args.valuePeriod,
    bodySite: args.bodySite,
    method: args.method,
    referenceRange: args.referenceRange,
    note: args.note ? [{ text: args.note }] : undefined,
    interpretation: args.interpretation,
    identifier: args.identifier ? [{ system: args.identifier.system, value: args.identifier.value }] : undefined,
    component: args.component,
  };

  return medplum.createResource<Observation>(observationResource);
}

export async function getObservationById(args: GetObservationByIdArgs): Promise<Observation | null> {
  await ensureAuthenticated();
  if (!args.observationId) {
    throw new Error('Observation ID is required to fetch an observation.');
  }
  try {
    return await medplum.readResource('Observation', args.observationId);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'outcome' in error &&
      (error as { outcome: { issue: { code: string }[] } }).outcome.issue?.[0]?.code === 'not-found'
    ) {
      return null;
    }
    throw error;
  }
}

export async function updateObservation(observationId: string, updates: UpdateObservationArgs): Promise<Observation> {
  await ensureAuthenticated();

  if (!observationId) {
    throw new Error('Observation ID is required to update an observation.');
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Updates object cannot be empty for updating an observation.');
  }

  const existingObservation = await medplum.readResource('Observation', observationId);
  if (!existingObservation) {
    throw new Error(`Observation with ID ${observationId} not found.`);
  }

  const {
    note: noteInput,
    identifier: identifierInput,
    encounterId: encounterIdInput,
    performerIds: performerIdsInput,
    subjectId: subjectIdInput,
    ...restOfUpdates
  } = updates;

  const workingUpdates: Partial<Observation> = {};

  // Safely map known fields from restOfUpdates to workingUpdates
  if (restOfUpdates.status !== undefined) workingUpdates.status = restOfUpdates.status;
  if (restOfUpdates.code !== undefined) workingUpdates.code = restOfUpdates.code;
  if (restOfUpdates.effectiveDateTime !== undefined)
    workingUpdates.effectiveDateTime = restOfUpdates.effectiveDateTime || undefined;
  if (restOfUpdates.effectivePeriod !== undefined)
    workingUpdates.effectivePeriod = restOfUpdates.effectivePeriod || undefined;
  if (restOfUpdates.issued !== undefined) workingUpdates.issued = restOfUpdates.issued;
  if (restOfUpdates.valueQuantity !== undefined)
    workingUpdates.valueQuantity = restOfUpdates.valueQuantity || undefined;
  if (restOfUpdates.valueCodeableConcept !== undefined)
    workingUpdates.valueCodeableConcept = restOfUpdates.valueCodeableConcept || undefined;
  if (restOfUpdates.valueString !== undefined) workingUpdates.valueString = restOfUpdates.valueString || undefined;
  if (restOfUpdates.valueBoolean !== undefined) workingUpdates.valueBoolean = restOfUpdates.valueBoolean || undefined;
  if (restOfUpdates.valueInteger !== undefined) workingUpdates.valueInteger = restOfUpdates.valueInteger || undefined;
  if (restOfUpdates.valueRange !== undefined) workingUpdates.valueRange = restOfUpdates.valueRange || undefined;
  if (restOfUpdates.valueRatio !== undefined) workingUpdates.valueRatio = restOfUpdates.valueRatio || undefined;
  if (restOfUpdates.valueSampledData !== undefined)
    workingUpdates.valueSampledData = restOfUpdates.valueSampledData || undefined;
  if (restOfUpdates.valueTime !== undefined) workingUpdates.valueTime = restOfUpdates.valueTime || undefined;
  if (restOfUpdates.valueDateTime !== undefined)
    workingUpdates.valueDateTime = restOfUpdates.valueDateTime || undefined;
  if (restOfUpdates.valuePeriod !== undefined) workingUpdates.valuePeriod = restOfUpdates.valuePeriod || undefined;
  if (restOfUpdates.bodySite !== undefined) workingUpdates.bodySite = restOfUpdates.bodySite || undefined;
  if (restOfUpdates.method !== undefined) workingUpdates.method = restOfUpdates.method || undefined;
  if (restOfUpdates.referenceRange !== undefined)
    workingUpdates.referenceRange = restOfUpdates.referenceRange || undefined;
  if (restOfUpdates.interpretation !== undefined)
    workingUpdates.interpretation = restOfUpdates.interpretation || undefined;

  // Handle specific conversions for note
  if (typeof noteInput === 'string') {
    workingUpdates.note = [{ text: noteInput }];
  } else if (noteInput === null) {
    workingUpdates.note = undefined;
  }

  // Handle specific conversions for identifier
  if (identifierInput && typeof identifierInput === 'object') {
    workingUpdates.identifier = [identifierInput as Identifier];
  } else if (identifierInput === null) {
    workingUpdates.identifier = undefined;
  }

  // Handle subjectId to subject reference
  if (typeof subjectIdInput === 'string') {
    workingUpdates.subject = { reference: `Patient/${subjectIdInput}` };
  } else if (subjectIdInput === null) {
    workingUpdates.subject = undefined;
  }

  // Handle encounterId to encounter reference
  if (typeof encounterIdInput === 'string') {
    workingUpdates.encounter = { reference: `Encounter/${encounterIdInput}` };
  } else if (encounterIdInput === null) {
    workingUpdates.encounter = undefined;
  }

  // Handle performerIds to performer references
  if (Array.isArray(performerIdsInput)) {
    workingUpdates.performer = performerIdsInput.map((id) => ({ reference: `Practitioner/${id}` }));
  } else if (performerIdsInput === null) {
    workingUpdates.performer = undefined;
  }

  // value[x] exclusivity logic
  const valueFields: (keyof Observation)[] = [
    'valueQuantity',
    'valueCodeableConcept',
    'valueString',
    'valueBoolean',
    'valueInteger',
    'valueRange',
    'valueRatio',
    'valueSampledData',
    'valueTime',
    'valueDateTime',
    'valuePeriod',
  ];

  let valueKeyPresentInUpdates: keyof Observation | undefined;
  for (const key of valueFields) {
    // Check if the key exists in the original updates object (including restOfUpdates)
    if (
      Object.prototype.hasOwnProperty.call(restOfUpdates, key) &&
      (restOfUpdates as any)[key] !== undefined
    ) {
      valueKeyPresentInUpdates = key;
    }
  }

  if (valueKeyPresentInUpdates) {
    for (const key of valueFields) {
      if (key !== valueKeyPresentInUpdates) {
        // Explicitly set to undefined to remove
        // We need to be careful with type safety here.
        // Since workingUpdates is Partial<Observation>, we can set keys to undefined.
        // However, TS doesn't like dynamic key access on the generic type easily without casting or strict checks.
        // Since we know 'key' is a valid key of Observation, we can use a type assertion that is safe.
        (workingUpdates as Record<keyof Observation, unknown>)[key] = undefined;
      }
    }
  }

  const updatedResource: Observation = {
    ...existingObservation,
    ...workingUpdates,
    resourceType: 'Observation',
    id: observationId,
  };

  return medplum.updateResource(updatedResource);
}

export async function searchObservations(args: ObservationSearchArgs): Promise<Observation[]> {
  await ensureAuthenticated();
  const searchCriteria: string[] = [];

  if (Object.keys(args).length === 0) {
    console.error(
      'Observation search called with no specific criteria. This might return a large number of results or be inefficient.',
    );
  }

  if (args.patientId) {
    searchCriteria.push(`subject=Patient/${args.patientId}`);
  } else if (args.subject) {
    searchCriteria.push(`subject=${args.subject}`);
  }

  if (args.code) {
    if (args.codeSystem) {
      searchCriteria.push(`code=${args.codeSystem}|${args.code}`);
    } else {
      searchCriteria.push(`code=${args.code}`);
    }
  }
  if (args.encounterId) {
    searchCriteria.push(`encounter=Encounter/${args.encounterId}`);
  }
  if (args.date) {
    const dateValue = args.date.match(/^(eq|ne|gt|lt|ge|le)/) ? args.date : `eq${args.date}`;
    searchCriteria.push(`date=${dateValue}`);
  }
  if (args.status) {
    searchCriteria.push(`status=${args.status}`);
  }
  if (args.performer) {
    searchCriteria.push(`performer=${args.performer}`);
  }
  if (args.identifier) {
    searchCriteria.push(`identifier=${args.identifier}`);
  }
  if (args._lastUpdated) {
    searchCriteria.push(`_lastUpdated=${args._lastUpdated}`);
  }

  if (searchCriteria.length === 0 && Object.keys(args).length > 0) {
    console.error('Observation search arguments provided but did not map to any known search parameters:', args);
    return [];
  }

  if (searchCriteria.length > 0 || Object.keys(args).length === 0) {
    const queryString = searchCriteria.join('&');
    return medplum.searchResources('Observation', queryString);
  } else {
    return [];
  }
}
