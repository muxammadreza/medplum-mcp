/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { resourceTypes } from '../resourceList';
import { GenericResourceTool } from './genericResourceTool';
import { specificToolDefinitions } from './specificToolSchemas';
import { ConditionClinicalStatusCodes, ConditionVerificationStatusCodes } from './conditionUtils';

// Import existing specific implementations
import * as patientUtils from './patientUtils';
import * as practitionerUtils from './practitionerUtils';
import * as organizationUtils from './organizationUtils';
import * as encounterUtils from './encounterUtils';
import * as observationUtils from './observationUtils';
import * as medicationRequestUtils from './medicationRequestUtils';
import * as medicationUtils from './medicationUtils';
import * as episodeOfCareUtils from './episodeOfCareUtils';
import * as conditionUtils from './conditionUtils';
import * as generalFhirSearchUtils from './generalFhirSearchUtils';

// Import new utils
import * as transactionUtils from './transactionUtils';
import * as binaryUtils from './binaryUtils';
import * as authUtils from './authUtils';
import * as operationsUtils from './operationsUtils';
import * as adminUtils from './adminUtils';
import * as superAdminUtils from './superAdminUtils';
import * as advancedUtils from './advancedUtils';
import * as dataUtils from './dataUtils';
import * as versionUtils from './versionUtils';
import * as miscUtils from './miscUtils';

// Map of resource type to specific utils
const specificUtils: Record<string, any> = {
  Patient: patientUtils,
  Practitioner: practitionerUtils,
  Organization: organizationUtils,
  Encounter: encounterUtils,
  Observation: observationUtils,
  MedicationRequest: medicationRequestUtils,
  Medication: medicationUtils,
  EpisodeOfCare: episodeOfCareUtils,
  Condition: conditionUtils,
};

export const toolDefinitions: any[] = [];
export const toolMapping: Record<string, (...args: any[]) => Promise<any>> = {};

// Register General FHIR Search Tool
toolDefinitions.push({
  name: 'generalFhirSearch',
  description: 'Performs a generic FHIR search operation on any resource type with custom query parameters.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: {
        type: 'string',
        description: "The FHIR resource type to search for (e.g., 'Patient', 'Observation').",
      },
      queryParams: {
        type: 'object',
        description:
          'A record of query parameters, where keys are FHIR search parameters and values are their corresponding values.',
        additionalProperties: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
      },
    },
    required: ['resourceType', 'queryParams'],
  },
});
toolMapping['generalFhirSearch'] = generalFhirSearchUtils.generalFhirSearch;

// Register Transaction Tool
toolDefinitions.push({
  name: 'postBundle',
  description: 'Executes a FHIR Bundle (transaction or batch).',
  inputSchema: {
    type: 'object',
    properties: {
      bundle: {
        type: 'object',
        description: 'The FHIR Bundle to execute.',
        additionalProperties: true,
      },
    },
    required: ['bundle'],
  },
});
toolMapping['postBundle'] = transactionUtils.postBundle;

// Register Binary Tools
toolDefinitions.push({
  name: 'createBinary',
  description: 'Creates a Binary resource (uploads data).',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'string', description: 'Base64 encoded data.' },
      contentType: { type: 'string', description: 'MIME type of the data.' },
      filename: { type: 'string', description: 'Optional filename.' },
    },
    required: ['data', 'contentType'],
  },
});
toolMapping['createBinary'] = binaryUtils.createBinary;

toolDefinitions.push({
  name: 'getBinaryById',
  description: 'Retrieves a Binary resource.',
  inputSchema: {
    type: 'object',
    properties: {
      binaryId: { type: 'string', description: 'ID of the Binary resource.' },
    },
    required: ['binaryId'],
  },
});
toolMapping['getBinaryById'] = binaryUtils.getBinaryById;

// Register Auth Tools
toolDefinitions.push({
  name: 'whoAmI',
  description: 'Returns the current authenticated user/project membership.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['whoAmI'] = authUtils.whoAmI;

// Register Operations Tools
toolDefinitions.push({
  name: 'validateResource',
  description: 'Validates a FHIR resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      resource: { type: 'object' },
    },
    required: ['resource'],
  },
});
toolMapping['validateResource'] = operationsUtils.validateResource;

toolDefinitions.push({
  name: 'expandValueSet',
  description: 'Expands a ValueSet.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'The canonical URL of the ValueSet to expand.' },
      filter: { type: 'string', description: 'Text filter for the expansion.' },
    },
    required: ['url'],
  },
});
toolMapping['expandValueSet'] = operationsUtils.expandValueSet;

toolDefinitions.push({
  name: 'lookupCode',
  description: 'Looks up a code in a CodeSystem.',
  inputSchema: {
    type: 'object',
    properties: {
      system: { type: 'string' },
      code: { type: 'string' },
    },
    required: ['system', 'code'],
  },
});
toolMapping['lookupCode'] = operationsUtils.lookupCode;

toolDefinitions.push({
  name: 'validateCode',
  description: 'Validates a code in a CodeSystem.',
  inputSchema: {
    type: 'object',
    properties: {
      system: { type: 'string' },
      code: { type: 'string' },
      display: { type: 'string' },
    },
    required: ['system', 'code'],
  },
});
toolMapping['validateCode'] = operationsUtils.validateCode;

// Register Admin Tools
toolDefinitions.push({
  name: 'inviteUser',
  description: 'Invites a user to the project.',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
      email: { type: 'string' },
      resourceType: { type: 'string', enum: ['Patient', 'Practitioner', 'RelatedPerson'] },
      accessPolicy: { type: 'object', description: 'Reference to AccessPolicy' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      sendEmail: { type: 'boolean' },
      admin: { type: 'boolean' },
    },
    required: ['projectId', 'email'],
  },
});
toolMapping['inviteUser'] = adminUtils.inviteUser;

toolDefinitions.push({
  name: 'addProjectSecret',
  description: 'Adds or updates a secret in a Project.',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
      name: { type: 'string' },
      value: { type: 'string' },
    },
    required: ['projectId', 'name', 'value'],
  },
});
toolMapping['addProjectSecret'] = adminUtils.addProjectSecret;

// Register Super Admin Tools
toolDefinitions.push({
  name: 'reindexResources',
  description: 'Super Admin: Reindexes resources.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceTypes: { type: 'array', items: { type: 'string' } },
    },
  },
});
toolMapping['reindexResources'] = superAdminUtils.reindexResources;

toolDefinitions.push({
  name: 'rebuildCompartments',
  description: 'Super Admin: Rebuilds compartments for a resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      id: { type: 'string' },
    },
    required: ['resourceType', 'id'],
  },
});
toolMapping['rebuildCompartments'] = superAdminUtils.rebuildCompartments;

toolDefinitions.push({
  name: 'purgeResources',
  description: 'Super Admin: Purges resources before a certain date.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      before: { type: 'string', description: 'ISO Date string' },
    },
    required: ['resourceType', 'before'],
  },
});
toolMapping['purgeResources'] = superAdminUtils.purgeResources;

toolDefinitions.push({
  name: 'forceSetPassword',
  description: 'Super Admin: Force sets a password for a user.',
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      password: { type: 'string' },
    },
    required: ['userId', 'password'],
  },
});
toolMapping['forceSetPassword'] = superAdminUtils.forceSetPassword;

// Register Advanced Utils
toolDefinitions.push({
  name: 'executeBot',
  description: 'Executes a Bot.',
  inputSchema: {
    type: 'object',
    properties: {
      botId: { type: 'string' },
      data: { type: 'object' },
      contentType: { type: 'string' },
    },
    required: ['botId', 'data'],
  },
});
toolMapping['executeBot'] = advancedUtils.executeBot;

toolDefinitions.push({
  name: 'graphql',
  description: 'Executes a GraphQL query.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      operationName: { type: 'string' },
      variables: { type: 'object' },
    },
    required: ['query'],
  },
});
toolMapping['graphql'] = advancedUtils.graphql;

toolDefinitions.push({
  name: 'pushToAgent',
  description: 'Pushes a message to an Agent.',
  inputSchema: {
    type: 'object',
    properties: {
      agentId: { type: 'string' },
      body: { type: 'string' },
      contentType: { type: 'string' },
      destination: { type: 'string' },
      waitForResponse: { type: 'boolean' },
    },
    required: ['agentId', 'body'],
  },
});
toolMapping['pushToAgent'] = advancedUtils.pushToAgent;

// Register Data Utils
toolDefinitions.push({
  name: 'bulkExport',
  description: 'Starts a bulk export job.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceTypes: { type: 'array', items: { type: 'string' } },
      since: { type: 'string' },
      outputFormat: { type: 'string' },
    },
  },
});
toolMapping['bulkExport'] = dataUtils.bulkExport;

toolDefinitions.push({
  name: 'readPatientEverything',
  description: 'Reads all data for a patient.',
  inputSchema: {
    type: 'object',
    properties: {
      patientId: { type: 'string' },
    },
    required: ['patientId'],
  },
});
toolMapping['readPatientEverything'] = dataUtils.readPatientEverything;

toolDefinitions.push({
  name: 'readPatientSummary',
  description: 'Reads a summary for a patient.',
  inputSchema: {
    type: 'object',
    properties: {
      patientId: { type: 'string' },
    },
    required: ['patientId'],
  },
});
toolMapping['readPatientSummary'] = dataUtils.readPatientSummary;

toolDefinitions.push({
  name: 'readResourceGraph',
  description: 'Reads a graph of resources connected to a resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      id: { type: 'string' },
    },
    required: ['resourceType', 'id'],
  },
});
toolMapping['readResourceGraph'] = dataUtils.readResourceGraph;

toolDefinitions.push({
  name: 'requestSchema',
  description: 'Requests the schema for a resource type.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
    },
    required: ['resourceType'],
  },
});
toolMapping['requestSchema'] = dataUtils.requestSchema;

// Register Version Utils
toolDefinitions.push({
  name: 'readHistory',
  description: 'Reads the history of a resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      id: { type: 'string' },
    },
    required: ['resourceType', 'id'],
  },
});
toolMapping['readHistory'] = versionUtils.readHistory;

toolDefinitions.push({
  name: 'readVersion',
  description: 'Reads a specific version of a resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      id: { type: 'string' },
      vid: { type: 'string' },
    },
    required: ['resourceType', 'id', 'vid'],
  },
});
toolMapping['readVersion'] = versionUtils.readVersion;

// Register Misc Utils
toolDefinitions.push({
  name: 'upsertResource',
  description: 'Upserts a resource (update if exists, create if not).',
  inputSchema: {
    type: 'object',
    properties: {
      resource: { type: 'object' },
      search: { type: 'object' },
    },
    required: ['resource'],
  },
});
toolMapping['upsertResource'] = miscUtils.upsertResource;

toolDefinitions.push({
  name: 'createComment',
  description: 'Creates a comment on a resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      id: { type: 'string' },
      text: { type: 'string' },
    },
    required: ['resourceType', 'id', 'text'],
  },
});
toolMapping['createComment'] = miscUtils.createComment;

toolDefinitions.push({
  name: 'startNewProject',
  description: 'Starts a new project.',
  inputSchema: {
    type: 'object',
    properties: {
      login: { type: 'string' },
      projectName: { type: 'string' },
    },
    required: ['login', 'projectName'],
  },
});
toolMapping['startNewProject'] = miscUtils.startNewProject;

toolDefinitions.push({
  name: 'startNewUser',
  description: 'Starts a new user.',
  inputSchema: {
    type: 'object',
    properties: {
      user: { type: 'object' },
    },
    required: ['user'],
  },
});
toolMapping['startNewUser'] = miscUtils.startNewUser;

toolDefinitions.push({
  name: 'startNewPatient',
  description: 'Starts a new patient.',
  inputSchema: {
    type: 'object',
    properties: {
      patient: { type: 'object' },
    },
    required: ['patient'],
  },
});
toolMapping['startNewPatient'] = miscUtils.startNewPatient;

toolDefinitions.push({
  name: 'getProject',
  description: 'Gets the current project details.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['getProject'] = miscUtils.getProject;

toolDefinitions.push({
  name: 'getProfile',
  description: 'Gets the current user profile.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['getProfile'] = miscUtils.getProfile;

toolDefinitions.push({
  name: 'createResourceIfNoneExist',
  description: 'Creates a resource if it does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      resource: { type: 'object' },
      query: { type: 'string' },
    },
    required: ['resource', 'query'],
  },
});
toolMapping['createResourceIfNoneExist'] = miscUtils.createResourceIfNoneExist;

toolDefinitions.push({
  name: 'createMedia',
  description: 'Creates a Media resource.',
  inputSchema: {
    type: 'object',
    properties: {
      content: { type: 'object' },
      contentType: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['content', 'contentType'],
  },
});
toolMapping['createMedia'] = miscUtils.createMedia;

toolDefinitions.push({
  name: 'createAttachment',
  description: 'Creates an Attachment.',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'object' },
      contentType: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['data', 'contentType'],
  },
});
toolMapping['createAttachment'] = miscUtils.createAttachment;

toolDefinitions.push({
  name: 'uploadMedia',
  description: 'Uploads media.',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'object' },
      contentType: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['data', 'contentType'],
  },
});
toolMapping['uploadMedia'] = miscUtils.uploadMedia;

toolDefinitions.push({
  name: 'fhircastPublish',
  description: 'Publishes a FHIRcast event.',
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string' },
      event: { type: 'object' },
    },
    required: ['topic', 'event'],
  },
});
toolMapping['fhircastPublish'] = miscUtils.fhircastPublish;

// 1. Add Specific Tools first
const specificToolNames = new Set(specificToolDefinitions.map((t) => t.name));

for (const def of specificToolDefinitions) {
  toolDefinitions.push(def);
  let func: any = null;
  const modules = Object.values(specificUtils);
  for (const mod of modules) {
    if (mod[def.name]) {
      func = mod[def.name];
      break;
    }
  }

  if (func) {
    // Wrap specific functions to handle argument mapping
    toolMapping[def.name] = async (args: any) => {
      const toolName = def.name;
      // Handle different argument patterns based on tool type (Logic copied from original index.ts)
      if (toolName.includes('ById')) {
        // Tools that take a single ID parameter
        const idKey = Object.keys(args).find((key) => key.endsWith('Id')) || 'id';
        const id = args[idKey];
        if (id && typeof id === 'string') {
          return await func(id);
        }
        return await func(args);
      } else if (toolName.startsWith('update')) {
        // Update tools that take ID and updates object
        const {
          patientId,
          practitionerId,
          organizationId,
          encounterId,
          observationId,
          medicationRequestId,
          medicationId,
          episodeOfCareId,
          conditionId,
          ...updates
        } = args;
        const id =
          patientId ||
          practitionerId ||
          organizationId ||
          encounterId ||
          observationId ||
          medicationRequestId ||
          medicationId ||
          episodeOfCareId ||
          conditionId;

        // Special handling for updateCondition
        if (toolName === 'updateCondition') {
          const updateArgs: any = { id };
          if (updates.clinicalStatus) {
            const key = (updates.clinicalStatus as string).toUpperCase() as keyof typeof ConditionClinicalStatusCodes;
            updateArgs.clinicalStatus = { coding: [ConditionClinicalStatusCodes[key]] };
          }
          if (updates.verificationStatus) {
            const verStatusMap: { [key: string]: string } = { 'entered-in-error': 'ENTERED-IN-ERROR' };
            const key = (verStatusMap[updates.verificationStatus] ||
              (updates.verificationStatus as string).toUpperCase()) as keyof typeof ConditionVerificationStatusCodes;
            updateArgs.verificationStatus = { coding: [ConditionVerificationStatusCodes[key]] };
          }
          if (updates.onsetString !== undefined) {
            updateArgs.onsetString = updates.onsetString;
          }
          return await func(updateArgs);
        } else {
          // Legacy update tools usually take (id, updates)
          return await func(id, updates);
        }
      } else if (toolName === 'createCondition') {
        // Special handling for createCondition
        const { patientId, code, clinicalStatus, onsetString, recordedDate } = args;
        const createArgs: any = {
          subject: { reference: `Patient/${patientId}` },
          code,
          onsetString,
          recordedDate,
        };
        if (clinicalStatus) {
          const key = (clinicalStatus as string).toUpperCase() as keyof typeof ConditionClinicalStatusCodes;
          createArgs.clinicalStatus = { coding: [ConditionClinicalStatusCodes[key]] };
        }
        return await func(createArgs);
      } else if (toolName === 'searchConditions') {
        // Special handling for searchConditions
        const { patientId, ...searchArgs } = args;
        if (patientId) {
          searchArgs.subject = patientId;
        }
        return await func(searchArgs);
      } else {
        // Tools that take the whole arguments object
        return await func(args);
      }
    };
  } else {
    // console.error(`Warning: Specific tool definition ${def.name} found but no implementation found.`);
  }
}

// 2. Add Generic Tools for everything else
for (const resourceType of resourceTypes) {
  // 1. Create
  const createToolName = `create${resourceType}`;
  if (!specificToolNames.has(createToolName)) {
    toolDefinitions.push({
      name: createToolName,
      description: `Creates a new ${resourceType} resource.`,
      inputSchema: {
        type: 'object',
        properties: {
          resource: {
            type: 'object',
            description: `The ${resourceType} resource data to create.`,
            additionalProperties: true,
          },
        },
        required: ['resource'],
      },
    });
    toolMapping[createToolName] = (args: any) => GenericResourceTool.create(resourceType, args.resource || args);
  }

  // 2. GetById
  const getToolName = `get${resourceType}ById`;
  if (!specificToolNames.has(getToolName)) {
    toolDefinitions.push({
      name: getToolName,
      description: `Retrieves a ${resourceType} resource by its unique ID.`,
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: `The unique ID of the ${resourceType} to retrieve.`,
          },
        },
        required: ['id'],
      },
    });
    toolMapping[getToolName] = (args: any) => {
      const id =
        typeof args === 'string'
          ? args
          : args.id || args[`${resourceType.charAt(0).toLowerCase() + resourceType.slice(1)}Id`];
      return GenericResourceTool.getById(resourceType, id);
    };
  }

  // 3. Update
  const updateToolName = `update${resourceType}`;
  if (!specificToolNames.has(updateToolName)) {
    toolDefinitions.push({
      name: updateToolName,
      description: `Updates an existing ${resourceType} resource.`,
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: `The unique ID of the ${resourceType} to update.`,
          },
          updates: {
            type: 'object',
            description: 'The fields to update.',
            additionalProperties: true,
          },
        },
        required: ['id', 'updates'],
      },
    });
    toolMapping[updateToolName] = (args: any) => {
      const id = args.id || args[`${resourceType.charAt(0).toLowerCase() + resourceType.slice(1)}Id`];
      const updates =
        args.updates ||
        (() => {
          const { id: _, ...rest } = args;
          return rest;
        })();
      return GenericResourceTool.update(resourceType, id, updates);
    };
  }

  // 4. Delete
  const deleteToolName = `delete${resourceType}`;
  // No specific tools have delete implemented in current repo, so we add it for all
  toolDefinitions.push({
    name: deleteToolName,
    description: `Deletes a ${resourceType} resource.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: `The unique ID of the ${resourceType} to delete.`,
        },
      },
      required: ['id'],
    },
  });
  toolMapping[deleteToolName] = (args: any) => {
    const id =
      typeof args === 'string'
        ? args
        : args.id || args[`${resourceType.charAt(0).toLowerCase() + resourceType.slice(1)}Id`];
    return GenericResourceTool.delete(resourceType, id);
  };

  // 5. Search
  const searchToolName = `search${resourceType}s`;
  if (!specificToolNames.has(searchToolName)) {
    toolDefinitions.push({
      name: searchToolName,
      description: `Searches for ${resourceType} resources.`,
      inputSchema: {
        type: 'object',
        description: 'Search parameters',
        additionalProperties: true,
      },
    });
    toolMapping[searchToolName] = (args: any) => GenericResourceTool.search(resourceType, args);
  }
}

// 6. Patch
// Adding generic Patch tool
toolDefinitions.push({
  name: 'patchResource',
  description: 'Patches a resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      id: { type: 'string' },
      patch: {
        type: 'object',
        description: 'JSON Patch operations',
        additionalProperties: true,
      },
    },
    required: ['resourceType', 'id', 'patch'],
  },
});
toolMapping['patchResource'] = (args: any) => GenericResourceTool.patch(args.resourceType, args.id, args.patch);
