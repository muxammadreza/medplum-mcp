/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GenericResourceTool } from './genericResourceTool';

// Import new utils
import * as transactionUtils from './transactionUtils';
import * as authUtils from './authUtils';
import * as operationsUtils from './operationsUtils';
import * as adminUtils from './adminUtils';
import * as superAdminUtils from './superAdminUtils';
import * as advancedUtils from './advancedUtils';
import * as dataUtils from './dataUtils';
import * as versionUtils from './versionUtils';
import * as miscUtils from './miscUtils';
import * as projectUtils from './projectUtils';
import * as instanceUtils from './instanceUtils';
import * as adminActionUtils from './adminActionUtils';
import * as bulkUtils from './bulkUtils';
import * as fhircastUtils from './fhircastUtils';
import { generalFhirSearch } from './generalFhirSearchUtils';

export const toolDefinitions: any[] = [];
export const toolMapping: Record<string, (...args: any[]) => Promise<any>> = {};

// --- Generic Resource Tools (The Core 5) ---

toolDefinitions.push({
  name: 'createResource',
  description: 'Creates a new FHIR resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: {
        type: 'string',
        description: 'The type of the resource to create (e.g., Patient, Observation).',
      },
      resource: {
        type: 'object',
        description: 'The resource data.',
        additionalProperties: true,
      },
    },
    required: ['resourceType', 'resource'],
  },
});
toolMapping['createResource'] = (args: any) => GenericResourceTool.create(args.resourceType, args.resource);

toolDefinitions.push({
  name: 'getResource',
  description: 'Retrieves a FHIR resource by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: {
        type: 'string',
        description: 'The type of the resource to retrieve.',
      },
      id: {
        type: 'string',
        description: 'The unique ID of the resource.',
      },
    },
    required: ['resourceType', 'id'],
  },
});
toolMapping['getResource'] = (args: any) => GenericResourceTool.getById(args.resourceType, args.id);

toolDefinitions.push({
  name: 'updateResource',
  description: 'Updates an existing FHIR resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: {
        type: 'string',
        description: 'The type of the resource to update.',
      },
      id: {
        type: 'string',
        description: 'The unique ID of the resource.',
      },
      updates: {
        type: 'object',
        description: 'The fields to update.',
        additionalProperties: true,
      },
    },
    required: ['resourceType', 'id', 'updates'],
  },
});
toolMapping['updateResource'] = (args: any) => GenericResourceTool.update(args.resourceType, args.id, args.updates);

toolDefinitions.push({
  name: 'deleteResource',
  description: 'Deletes a FHIR resource.',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: {
        type: 'string',
        description: 'The type of the resource to delete.',
      },
      id: {
        type: 'string',
        description: 'The unique ID of the resource.',
      },
    },
    required: ['resourceType', 'id'],
  },
});
toolMapping['deleteResource'] = (args: any) => GenericResourceTool.delete(args.resourceType, args.id);

toolDefinitions.push({
  name: 'searchResource',
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
toolMapping['searchResource'] = generalFhirSearch;

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

// --- Consolidated Utility Tools ---

// 1. FHIR Operations (validate, expand, lookup)
toolDefinitions.push({
  name: 'executeFhirOperation',
  description: 'Executes a standard FHIR operation (e.g., $validate, $expand, $lookup).',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'The operation name (e.g., "validate-resource", "expand-valueset", "lookup-code", "validate-code").',
        enum: ['validate-resource', 'expand-valueset', 'lookup-code', 'validate-code'],
      },
      parameters: {
        type: 'object',
        description: 'Parameters for the operation.',
        additionalProperties: true,
      },
    },
    required: ['operation', 'parameters'],
  },
});
toolMapping['executeFhirOperation'] = async (args: any) => {
  const { operation, parameters } = args;
  switch (operation) {
    case 'validate-resource':
      return await operationsUtils.validateResource({ resource: parameters.resource, resourceType: parameters.resourceType });
    case 'expand-valueset':
      return await operationsUtils.expandValueSet({ url: parameters.url, filter: parameters.filter });
    case 'lookup-code':
      return await operationsUtils.lookupCode({ system: parameters.system, code: parameters.code });
    case 'validate-code':
      return await operationsUtils.validateCode({ system: parameters.system, code: parameters.code, display: parameters.display });
    default:
      throw new Error(`Unknown FHIR operation: ${operation}`);
  }
};

// 2. Admin Tasks (Super Admin)
toolDefinitions.push({
  name: 'executeAdminTask',
  description: 'Executes an administrative task (Super Admin only).',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: 'The task to perform.',
        enum: ['reindex', 'rebuild-compartments', 'purge', 'force-set-password'],
      },
      parameters: {
        type: 'object',
        description: 'Parameters for the task.',
        additionalProperties: true,
      },
    },
    required: ['task', 'parameters'],
  },
});
toolMapping['executeAdminTask'] = async (args: any) => {
  const { task, parameters } = args;
  switch (task) {
    case 'reindex':
      return await superAdminUtils.reindexResources({ resourceTypes: parameters.resourceTypes });
    case 'rebuild-compartments':
      return await superAdminUtils.rebuildCompartments({ resourceType: parameters.resourceType, id: parameters.id });
    case 'purge':
      return await superAdminUtils.purgeResources({ resourceType: parameters.resourceType, before: parameters.before });
    case 'force-set-password':
      return await superAdminUtils.forceSetPassword({ userId: parameters.userId, password: parameters.password });
    default:
      throw new Error(`Unknown admin task: ${task}`);
  }
};

// 3. FHIRcast Management
toolDefinitions.push({
  name: 'manageFhirCast',
  description: 'Manages FHIRcast subscriptions and events.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['publish', 'subscribe', 'unsubscribe', 'get-context'],
      },
      parameters: {
        type: 'object',
        additionalProperties: true,
      },
    },
    required: ['action', 'parameters'],
  },
});
toolMapping['manageFhirCast'] = async (args: any) => {
  const { action, parameters } = args;
  switch (action) {
    case 'publish':
      // fhircastPublish is in miscUtils, not fhircastUtils
      return await miscUtils.fhircastPublish({ topic: parameters.topic, event: parameters.event });
    case 'subscribe':
      return await fhircastUtils.fhircastSubscribe({ topic: parameters.topic, events: parameters.events });
    case 'unsubscribe':
      return await fhircastUtils.fhircastUnsubscribe({ subscriptionRequest: parameters.subscriptionRequest });
    case 'get-context':
      return await fhircastUtils.fhircastGetContext({ topic: parameters.topic });
    default:
      throw new Error(`Unknown FHIRcast action: ${action}`);
  }
};

// --- Preserved Utility Tools (Distinct Domains) ---

// Transaction
toolDefinitions.push({
  name: 'postBundle',
  description: 'Executes a FHIR Bundle (transaction or batch).',
  inputSchema: {
    type: 'object',
    properties: {
      bundle: { type: 'object' },
    },
    required: ['bundle'],
  },
});
toolMapping['postBundle'] = transactionUtils.postBundle;

// Auth
toolDefinitions.push({
  name: 'whoAmI',
  description: 'Returns the current authenticated user/project membership.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['whoAmI'] = authUtils.whoAmI;

// Project Admin (Not Super Admin)
toolDefinitions.push({
  name: 'inviteUser',
  description: 'Invites a user to the project.',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
      email: { type: 'string' },
      resourceType: { type: 'string', enum: ['Patient', 'Practitioner', 'RelatedPerson'] },
      accessPolicy: { type: 'object' },
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

// Advanced / Runtime
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

// Data / Bulk
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
  name: 'bulkImport',
  description: 'Starts a bulk import job using the $import operation.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
    },
    required: ['url'],
  },
});
toolMapping['bulkImport'] = bulkUtils.bulkImport;

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

// Versioning
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

// Misc Project/User management
toolDefinitions.push({
  name: 'listProjects',
  description: 'Lists all projects accessible to the current user.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['listProjects'] = projectUtils.listProjects;

toolDefinitions.push({
  name: 'switchProject',
  description: 'Switches the active project context.',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
    },
    required: ['projectId'],
  },
});
toolMapping['switchProject'] = projectUtils.switchProject;

toolDefinitions.push({
  name: 'getHealthCheck',
  description: 'Performs a health check on the Medplum server.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['getHealthCheck'] = instanceUtils.getHealthCheck;

toolDefinitions.push({
  name: 'sendEmail',
  description: 'Sends an email using the Medplum Email API.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string' },
      subject: { type: 'string' },
      text: { type: 'string' },
      html: { type: 'string' },
    },
    required: ['to', 'subject'],
  },
});
toolMapping['sendEmail'] = adminActionUtils.sendEmail;

// Misc Helpers
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

// Consolidated "Start New" tools?
// startNewProject, startNewUser, startNewPatient could be "provision(type, ...)"?
// But startNewProject is quite distinct (creates a project).
// Let's keep them.
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

// Media/Attachment tools - Consolidate into 'manageMedia'?
// createMedia, createAttachment, uploadMedia
// These are often distinct enough.
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
