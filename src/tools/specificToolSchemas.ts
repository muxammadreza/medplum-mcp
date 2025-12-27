/* eslint-disable @typescript-eslint/no-unused-vars */
// Copied from src/index.ts
import { ConditionClinicalStatusCodes, ConditionVerificationStatusCodes } from './conditionUtils';

export const specificToolDefinitions = [
  // Patient Tools
  {
    name: 'createPatient',
    description: 'Creates a new patient resource. Requires first name, last name, and birth date.',
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: "The patient's first name.",
        },
        lastName: {
          type: 'string',
          description: "The patient's last name.",
        },
        birthDate: {
          type: 'string',
          description: "The patient's birth date in YYYY-MM-DD format.",
        },
        gender: {
          type: 'string',
          description: "The patient's gender (male, female, other, unknown). Optional.",
          enum: ['male', 'female', 'other', 'unknown'],
        },
      },
      required: ['firstName', 'lastName', 'birthDate'],
    },
  },
  {
    name: 'getPatientById',
    description: 'Retrieves a patient resource by their unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The unique ID of the patient to retrieve.',
        },
      },
      required: ['patientId'],
    },
  },
  {
    name: 'updatePatient',
    description: "Updates an existing patient's information. Requires the patient's ID and the fields to update.",
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The unique ID of the patient to update.',
        },
        firstName: {
          type: 'string',
          description: 'New first name for the patient.',
        },
        lastName: {
          type: 'string',
          description: 'New last name for the patient.',
        },
        birthDate: {
          type: 'string',
          description: 'New birth date in YYYY-MM-DD format.',
        },
        gender: {
          type: 'string',
          description: 'New gender (male, female, other, unknown).',
          enum: ['male', 'female', 'other', 'unknown'],
        },
      },
      required: ['patientId'],
    },
  },
  {
    name: 'searchPatients',
    description: 'Searches for patients based on criteria like name or birth date.',
    inputSchema: {
      type: 'object',
      properties: {
        given: {
          type: 'string',
          description: "The patient's given (first) name.",
        },
        family: {
          type: 'string',
          description: "The patient's family (last) name.",
        },
        birthdate: {
          type: 'string',
          description: "The patient's birth date in YYYY-MM-DD format.",
        },
        gender: {
          type: 'string',
          description: "The patient's gender.",
          enum: ['male', 'female', 'other', 'unknown'],
        },
      },
      required: [],
    },
  },
  // Practitioner Tools
  {
    name: 'searchPractitionersByName',
    description: 'Searches for medical practitioners based on their given name, family name, or a general name string.',
    inputSchema: {
      type: 'object',
      properties: {
        givenName: {
          type: 'string',
          description: "The practitioner's given (first) name.",
        },
        familyName: {
          type: 'string',
          description: "The practitioner's family (last) name.",
        },
        name: {
          type: 'string',
          description: 'A general name search string for the practitioner.',
        },
      },
      required: [],
    },
  },
  {
    name: 'createPractitioner',
    description: 'Creates a new medical practitioner. Requires given name and family name.',
    inputSchema: {
      type: 'object',
      properties: {
        givenName: {
          type: 'string',
          description: "The practitioner's given (first) name.",
        },
        familyName: {
          type: 'string',
          description: "The practitioner's family (last) name.",
        },
      },
      required: ['givenName', 'familyName'],
    },
  },
  {
    name: 'getPractitionerById',
    description: 'Retrieves a practitioner resource by their unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        practitionerId: {
          type: 'string',
          description: 'The unique ID of the practitioner to retrieve.',
        },
      },
      required: ['practitionerId'],
    },
  },
  {
    name: 'updatePractitioner',
    description:
      "Updates an existing practitioner's information. Requires the practitioner's ID and the fields to update.",
    inputSchema: {
      type: 'object',
      properties: {
        practitionerId: {
          type: 'string',
          description: 'The unique ID of the practitioner to update.',
        },
        active: {
          type: 'boolean',
          description: 'Update active status.',
        },
      },
      required: ['practitionerId'],
    },
  },
  {
    name: 'searchPractitioners',
    description: 'Searches for practitioners based on various criteria like name, specialty, or identifier.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'A general name search string.',
        },
        given: {
          type: 'string',
          description: "The practitioner's given (first) name.",
        },
        family: {
          type: 'string',
          description: "The practitioner's family (last) name.",
        },
        specialty: {
          type: 'string',
          description: "The practitioner's specialty (e.g., cardiology).",
        },
        identifier: {
          type: 'string',
          description: 'An identifier for the practitioner (e.g., NPI value).',
        },
      },
      required: [],
    },
  },
  // Organization Tools
  {
    name: 'createOrganization',
    description: 'Creates a new organization (e.g., hospital, clinic). Requires organization name.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The official name of the organization.',
        },
        alias: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of aliases for the organization. Optional.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'getOrganizationById',
    description: 'Retrieves an organization by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        organizationId: {
          type: 'string',
          description: 'The unique ID of the organization to retrieve.',
        },
      },
      required: ['organizationId'],
    },
  },
  {
    name: 'updateOrganization',
    description: 'Updates an existing organization. Requires the organization ID and the fields to update.',
    inputSchema: {
      type: 'object',
      properties: {
        organizationId: {
          type: 'string',
          description: 'The unique ID of the organization to update.',
        },
        name: {
          type: 'string',
          description: 'The new official name of the organization. Optional.',
        },
        alias: {
          type: 'array',
          items: { type: 'string' },
          description: 'An updated list of aliases. Optional.',
        },
      },
      required: ['organizationId'],
    },
  },
  {
    name: 'searchOrganizations',
    description: 'Searches for organizations based on criteria like name or address. Provide at least one criterion.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the organization to search for. Optional.',
        },
        address: {
          type: 'string',
          description: "Part of the organization's address to search for. Optional.",
        },
      },
      required: [],
    },
  },
  // Encounter Tools
  {
    name: 'createEncounter',
    description: 'Creates a new encounter (patient visit). Requires patient ID and status.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient for this encounter.',
        },
        status: {
          type: 'string',
          description: 'The status of the encounter.',
          enum: ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled'],
        },
        classCode: {
          type: 'string',
          description:
            'The classification of the encounter (e.g., AMB for ambulatory, IMP for inpatient, EMER for emergency).',
        },
        practitionerId: {
          type: 'string',
          description: 'The ID of the practitioner involved in the encounter. Optional.',
        },
        organizationId: {
          type: 'string',
          description: 'The ID of the organization providing the encounter. Optional.',
        },
      },
      required: ['patientId', 'status', 'classCode'],
    },
  },
  {
    name: 'getEncounterById',
    description: 'Retrieves an encounter by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        encounterId: {
          type: 'string',
          description: 'The unique ID of the encounter to retrieve.',
        },
      },
      required: ['encounterId'],
    },
  },
  {
    name: 'updateEncounter',
    description: 'Updates an existing encounter. Requires the encounter ID and the fields to update.',
    inputSchema: {
      type: 'object',
      properties: {
        encounterId: {
          type: 'string',
          description: 'The unique ID of the encounter to update.',
        },
        status: {
          type: 'string',
          description: 'New status for the encounter.',
          enum: ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled'],
        },
      },
      required: ['encounterId'],
    },
  },
  {
    name: 'searchEncounters',
    description: 'Searches for encounters based on criteria like patient ID or status.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The patient ID to search encounters for. Optional.',
        },
        status: {
          type: 'string',
          description: 'The encounter status to filter by. Optional.',
          enum: ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled'],
        },
        practitionerId: {
          type: 'string',
          description: 'The practitioner ID to search encounters for. Optional.',
        },
      },
      required: [],
    },
  },
  // Observation Tools
  {
    name: 'createObservation',
    description: 'Creates a new observation (lab result, vital sign, etc.). Requires patient ID and code.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient this observation is for.',
        },
        code: {
          type: 'string',
          description: 'The code representing what was observed (LOINC, SNOMED CT, etc.).',
        },
        valueQuantity: {
          type: 'number',
          description: 'Numeric value of the observation. Optional.',
        },
        valueString: {
          type: 'string',
          description: 'String value of the observation. Optional.',
        },
        status: {
          type: 'string',
          description: 'The status of the observation.',
          enum: ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled'],
        },
        encounterId: {
          type: 'string',
          description: 'The encounter this observation is associated with. Optional.',
        },
      },
      required: ['patientId', 'code', 'status'],
    },
  },
  {
    name: 'getObservationById',
    description: 'Retrieves an observation by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        observationId: {
          type: 'string',
          description: 'The unique ID of the observation to retrieve.',
        },
      },
      required: ['observationId'],
    },
  },
  {
    name: 'updateObservation',
    description: 'Updates an existing observation. Requires the observation ID and the fields to update.',
    inputSchema: {
      type: 'object',
      properties: {
        observationId: {
          type: 'string',
          description: 'The unique ID of the observation to update.',
        },
        status: {
          type: 'string',
          description: 'New status for the observation.',
          enum: ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled'],
        },
        valueQuantity: {
          type: 'number',
          description: 'New numeric value of the observation. Optional.',
        },
        valueString: {
          type: 'string',
          description: 'New string value of the observation. Optional.',
        },
      },
      required: ['observationId'],
    },
  },
  {
    name: 'searchObservations',
    description: 'Searches for observations based on criteria like patient ID or code.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The patient ID to search observations for. Optional.',
        },
        code: {
          type: 'string',
          description: 'The observation code to filter by. Optional.',
        },
        status: {
          type: 'string',
          description: 'The observation status to filter by. Optional.',
          enum: ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled'],
        },
        encounterId: {
          type: 'string',
          description: 'The encounter ID to search observations for. Optional.',
        },
      },
      required: [],
    },
  },
  // Medication Request Tools
  {
    name: 'createMedicationRequest',
    description:
      'Creates a new medication request (prescription). Requires patient ID, medication reference, and prescriber.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient this prescription is for.',
        },
        medicationReference: {
          type: 'string',
          description: 'Reference to the medication being prescribed.',
        },
        practitionerId: {
          type: 'string',
          description: 'The ID of the practitioner prescribing the medication.',
        },
        status: {
          type: 'string',
          description: 'The status of the medication request.',
          enum: ['active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown'],
        },
        intent: {
          type: 'string',
          description: 'The intent of the medication request.',
          enum: [
            'proposal',
            'plan',
            'order',
            'original-order',
            'reflex-order',
            'filler-order',
            'instance-order',
            'option',
          ],
        },
      },
      required: ['patientId', 'medicationReference', 'practitionerId', 'status', 'intent'],
    },
  },
  {
    name: 'getMedicationRequestById',
    description: 'Retrieves a medication request by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        medicationRequestId: {
          type: 'string',
          description: 'The unique ID of the medication request to retrieve.',
        },
      },
      required: ['medicationRequestId'],
    },
  },
  {
    name: 'updateMedicationRequest',
    description: 'Updates an existing medication request. Requires the medication request ID and fields to update.',
    inputSchema: {
      type: 'object',
      properties: {
        medicationRequestId: {
          type: 'string',
          description: 'The unique ID of the medication request to update.',
        },
        status: {
          type: 'string',
          description: 'New status for the medication request.',
          enum: ['active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown'],
        },
      },
      required: ['medicationRequestId'],
    },
  },
  {
    name: 'searchMedicationRequests',
    description: 'Searches for medication requests based on criteria like patient ID or medication.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The patient ID to search medication requests for. Optional.',
        },
        medicationReference: {
          type: 'string',
          description: 'The medication reference to filter by. Optional.',
        },
        practitionerId: {
          type: 'string',
          description: 'The practitioner ID to search medication requests for. Optional.',
        },
        status: {
          type: 'string',
          description: 'The medication request status to filter by. Optional.',
          enum: ['active', 'on-hold', 'cancelled', 'completed', 'entered-in-error', 'stopped', 'draft', 'unknown'],
        },
      },
      required: [],
    },
  },
  // Medication Tools
  {
    name: 'createMedication',
    description: 'Creates a new medication resource. Requires medication code or identifier.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code identifying the medication (e.g., RxNorm, SNOMED CT).',
        },
        display: {
          type: 'string',
          description: 'The display name of the medication.',
        },
        form: {
          type: 'string',
          description: 'The form of the medication (e.g., tablet, capsule, liquid).',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'getMedicationById',
    description: 'Retrieves a medication by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        medicationId: {
          type: 'string',
          description: 'The unique ID of the medication to retrieve.',
        },
      },
      required: ['medicationId'],
    },
  },
  {
    name: 'searchMedications',
    description: 'Searches for medications based on criteria like code or name.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The medication code to search for. Optional.',
        },
        name: {
          type: 'string',
          description: 'Part of the medication name to search for. Optional.',
        },
        form: {
          type: 'string',
          description: 'The medication form to filter by. Optional.',
        },
      },
      required: [],
    },
  },
  // Episode of Care Tools
  {
    name: 'createEpisodeOfCare',
    description: 'Creates a new episode of care for a patient. Requires patient ID and status.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient this episode of care is for.',
        },
        status: {
          type: 'string',
          description: 'The status of the episode of care.',
          enum: ['planned', 'waitlist', 'active', 'onhold', 'finished', 'cancelled', 'entered-in-error'],
        },
        managingOrganizationId: {
          type: 'string',
          description: 'The ID of the organization managing this episode. Optional.',
        },
      },
      required: ['patientId', 'status'],
    },
  },
  {
    name: 'getEpisodeOfCareById',
    description: 'Retrieves an episode of care by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        episodeOfCareId: {
          type: 'string',
          description: 'The unique ID of the episode of care to retrieve.',
        },
      },
      required: ['episodeOfCareId'],
    },
  },
  {
    name: 'updateEpisodeOfCare',
    description: 'Updates an existing episode of care. Requires the episode ID and fields to update.',
    inputSchema: {
      type: 'object',
      properties: {
        episodeOfCareId: {
          type: 'string',
          description: 'The unique ID of the episode of care to update.',
        },
        status: {
          type: 'string',
          description: 'New status for the episode of care.',
          enum: ['planned', 'waitlist', 'active', 'onhold', 'finished', 'cancelled', 'entered-in-error'],
        },
      },
      required: ['episodeOfCareId'],
    },
  },
  {
    name: 'searchEpisodesOfCare',
    description: 'Searches for episodes of care based on criteria like patient ID or status.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The patient ID to search episodes for. Optional.',
        },
        status: {
          type: 'string',
          description: 'The episode status to filter by. Optional.',
          enum: ['planned', 'waitlist', 'active', 'onhold', 'finished', 'cancelled', 'entered-in-error'],
        },
        managingOrganizationId: {
          type: 'string',
          description: 'The managing organization ID to filter by. Optional.',
        },
      },
      required: [],
    },
  },
  // Condition Tool Schemas
  {
    name: 'createCondition',
    description: 'Creates a new condition or diagnosis for a patient. Requires a patient ID and a condition code.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient for whom the condition is being created.',
        },
        code: {
          type: 'object',
          description: 'The code representing the condition. Must include a coding system, code, and display text.',
          properties: {
            coding: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  system: {
                    type: 'string',
                    description: 'The URI of the coding system (e.g., "http://snomed.info/sct").',
                  },
                  code: { type: 'string', description: 'The code from the system (e.g., "44054006").' },
                  display: {
                    type: 'string',
                    description: 'The human-readable display text for the code (e.g., "Type 2 diabetes mellitus").',
                  },
                },
                required: ['system', 'code', 'display'],
              },
            },
            text: { type: 'string', description: 'A human-readable summary of the condition.' },
          },
          required: ['coding', 'text'],
        },
        clinicalStatus: {
          type: 'string',
          description: 'The clinical status of the condition. For example: "active", "inactive", "resolved".',
          enum: ['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'],
        },
        onsetString: {
          type: 'string',
          description: 'Estimated date, state, or age when the condition began (e.g., "about 3 years ago"). Optional.',
        },
        recordedDate: {
          type: 'string',
          description: 'The date the condition was recorded, in YYYY-MM-DD format. Optional.',
        },
      },
      required: ['patientId', 'code'],
    },
  },
  {
    name: 'getConditionById',
    description: 'Retrieves a condition resource by its unique ID.',
    inputSchema: {
      type: 'object',
      properties: {
        conditionId: {
          type: 'string',
          description: 'The unique ID of the condition to retrieve.',
        },
      },
      required: ['conditionId'],
    },
  },
  {
    name: 'updateCondition',
    description: 'Updates an existing condition. Requires the condition ID and at least one field to update.',
    inputSchema: {
      type: 'object',
      properties: {
        conditionId: {
          type: 'string',
          description: 'The unique ID of the condition to update.',
        },
        clinicalStatus: {
          type: 'string',
          description: 'The new clinical status of the condition.',
          enum: ['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'],
        },
        verificationStatus: {
          type: 'string',
          description: 'The new verification status of the condition.',
          enum: ['unconfirmed', 'provisional', 'differential', 'confirmed', 'refuted', 'entered-in-error'],
        },
        onsetString: {
          type: 'string',
          description: 'Update the onset description. To remove this field, provide a `null` value.',
        },
      },
      required: ['conditionId'],
    },
  },
  {
    name: 'searchConditions',
    description: 'Searches for conditions based on patient and other criteria. Requires a patient ID.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient whose conditions are being searched.',
        },
        code: {
          type: 'string',
          description: 'A code to filter by, e.g., "http://snomed.info/sct|44054006". Optional.',
        },
        'clinical-status': {
          type: 'string',
          description: 'Filter by clinical status.',
          enum: ['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'],
        },
        category: {
          type: 'string',
          description: 'Filter by category, e.g., "encounter-diagnosis" or "problem-list-item".',
        },
      },
      required: ['patientId'],
    },
  },
];
