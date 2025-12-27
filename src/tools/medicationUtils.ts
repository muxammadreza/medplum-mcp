import { Medication, CodeableConcept, Identifier, OperationOutcome, Reference, Organization } from '@medplum/fhirtypes';
import { medplum, MedplumClient, ensureAuthenticated } from '../config/medplumClient';

// Medication.status is a string literal type in FHIR R4
export type MedicationStatus = 'active' | 'inactive' | 'entered-in-error';

export interface CreateMedicationArgs {
  code: CodeableConcept;
  status?: MedicationStatus;
  manufacturer?: Reference<Organization>; // Corrected to Reference<Organization>
  form?: CodeableConcept;
  identifier?: Identifier[];
}

export interface MedicationSearchArgs {
  code?: string;
  identifier?: string;
  status?: MedicationStatus;
}

/**
 * Creates a new Medication resource.
 * @param args The arguments for creating the medication.
 * @param client Optional MedplumClient to use.
 * @returns The created Medication resource or an OperationOutcome in case of an error.
 */
export async function createMedication(
  args: CreateMedicationArgs,
  client?: MedplumClient, // Restore optional client
): Promise<Medication | OperationOutcome> {
  const medplumClient = client || medplum;
  await ensureAuthenticated();
  try {
    if (!args.code || !args.code.coding || args.code.coding.length === 0) {
      throw new Error('Medication code with at least one coding is required.');
    }

    const medicationResource: Medication = {
      resourceType: 'Medication',
      code: args.code,
      status: args.status,
      manufacturer: args.manufacturer,
      form: args.form,
      identifier: args.identifier,
    };

    // Remove undefined keys
    Object.keys(medicationResource).forEach(
      (key) => (medicationResource as any)[key] === undefined && delete (medicationResource as any)[key],
    );

    const createdMedication = (await medplumClient.createResource(medicationResource)) as Medication;
    // console.log('Medication created successfully:', createdMedication);
    return createdMedication;
  } catch (error: any) {
    console.error('Error creating Medication:', error);
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'exception',
          diagnostics: `Error creating Medication: ${error.message || 'Unknown error'}`,
        },
      ],
    };
    if (error.outcome) {
      console.error('Server OperationOutcome:', JSON.stringify(error.outcome, null, 2));
      return error.outcome as OperationOutcome;
    }
    return outcome;
  }
}

/**
 * Retrieves a Medication resource by its ID.
 * @param medicationId The ID of the Medication to retrieve.
 * @param client Optional MedplumClient to use.
 * @returns The Medication resource or null if not found, or an OperationOutcome on error.
 */
export async function getMedicationById(
  medicationId: string,
  client?: MedplumClient,
): Promise<Medication | null | OperationOutcome> {
  const medplumClient = client || medplum;
  await ensureAuthenticated();
  try {
    if (!medicationId) {
      throw new Error('Medication ID is required.');
    }
    const medication = (await medplumClient.readResource('Medication', medicationId)) as Medication | null;
    // console.log('Medication retrieved:', medication);
    return medication;
  } catch (error: any) {
    if (error.outcome && error.outcome.issue && error.outcome.issue[0]?.code === 'not-found') {
      // console.log(`Medication with ID "${medicationId}" not found.`);
      return null;
    }
    console.error(`Error retrieving Medication with ID "${medicationId}":`, error);
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'exception',
          diagnostics: `Error retrieving Medication: ${error.message || 'Unknown error'}`,
        },
      ],
    };
    if (error.outcome) {
      console.error('Server OperationOutcome:', JSON.stringify(error.outcome, null, 2));
      return error.outcome as OperationOutcome;
    }
    return outcome;
  }
}

/**
 * Searches for Medication resources based on specified criteria.
 * @param args The search criteria.
 * @param client Optional MedplumClient to use.
 * @returns An array of Medication resources matching the criteria or an OperationOutcome on error.
 */
export async function searchMedications(
  args: MedicationSearchArgs,
  client?: MedplumClient,
): Promise<Medication[] | OperationOutcome> {
  const medplumClient = client || medplum;
  await ensureAuthenticated();
  try {
    const searchCriteria: string[] = [];
    if (args.code) {
      searchCriteria.push(`code=${args.code}`);
    }
    if (args.identifier) {
      searchCriteria.push(`identifier=${args.identifier}`);
    }
    if (args.status) {
      searchCriteria.push(`status=${args.status}`);
    }

    if (searchCriteria.length === 0) {
      console.warn(
        'Searching for medications without any criteria. This might return a large dataset or be restricted by the server.',
      );
      return {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'invalid',
            diagnostics:
              'At least one search criterion (code, identifier, or status) must be provided for searching medications.',
          },
        ],
      };
    }

    const query = searchCriteria.join('&');
    // console.log('Searching medications with query:', query);

    const searchResult = await medplumClient.searchResources('Medication', query);
    const medications = searchResult as Medication[];

    // console.log(`Found ${medications.length} medications.`);
    return medications;
  } catch (error: any) {
    console.error('Error searching Medications:', error);
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'exception',
          diagnostics: `Error searching Medications: ${error.message || 'Unknown error'}`,
        },
      ],
    };
    if (error.outcome) {
      console.error('Server OperationOutcome:', JSON.stringify(error.outcome, null, 2));
      return error.outcome as OperationOutcome;
    }
    return outcome;
  }
}
