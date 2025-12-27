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
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as schemas from './specificToolSchemas';
import { Resource } from '@medplum/fhirtypes';

export const toolDefinitions: Tool[] = [];
// Use `unknown` instead of `any` for arguments and return types where applicable,
// but since the tools return various things, `Promise<unknown>` is safer than `Promise<any>`.
export const toolMapping: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {};

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
toolMapping['createResource'] = (args) => {
  const parsed = schemas.CreateResourceSchema.parse(args);
  return GenericResourceTool.create(parsed.resourceType, parsed.resource as Resource);
};

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
toolMapping['getResource'] = (args) => {
  const parsed = schemas.GetResourceSchema.parse(args);
  return GenericResourceTool.getById(parsed.resourceType, parsed.id);
};

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
toolMapping['updateResource'] = (args) => {
  const parsed = schemas.UpdateResourceSchema.parse(args);
  return GenericResourceTool.update(parsed.resourceType, parsed.id, parsed.updates as Partial<Resource>);
};

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
toolMapping['deleteResource'] = (args) => {
  const parsed = schemas.DeleteResourceSchema.parse(args);
  return GenericResourceTool.delete(parsed.resourceType, parsed.id);
};

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
toolMapping['searchResource'] = (args) => {
  const parsed = schemas.SearchResourceSchema.parse(args);
  return generalFhirSearch({
    resourceType: parsed.resourceType,
    queryParams: parsed.queryParams as Record<string, string | number | boolean | string[]>,
  });
};

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
toolMapping['patchResource'] = (args) => {
  const parsed = schemas.PatchResourceSchema.parse(args);
  return GenericResourceTool.patch(parsed.resourceType, parsed.id, parsed.patch as Record<string, unknown>[]);
};

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
        description:
          'The operation name (e.g., "validate-resource", "expand-valueset", "lookup-code", "validate-code").',
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
toolMapping['executeFhirOperation'] = async (args) => {
  const parsed = schemas.ExecuteFhirOperationSchema.parse(args);
  const parameters = parsed.parameters as Record<string, unknown>;

  switch (parsed.operation) {
    case 'validate-resource':
      return await operationsUtils.validateResource({
        resource: parameters.resource as Resource,
        resourceType: parameters.resourceType as string,
      });
    case 'expand-valueset':
      return await operationsUtils.expandValueSet({
        url: parameters.url as string,
        filter: parameters.filter as string,
      });
    case 'lookup-code':
      return await operationsUtils.lookupCode({
        system: parameters.system as string,
        code: parameters.code as string,
      });
    case 'validate-code':
      return await operationsUtils.validateCode({
        system: parameters.system as string,
        code: parameters.code as string,
        display: parameters.display as string,
      });
    default:
      // Should be caught by Zod enum validation
      throw new Error(`Unknown FHIR operation: ${parsed.operation}`);
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
toolMapping['executeAdminTask'] = async (args) => {
  const parsed = schemas.ExecuteAdminTaskSchema.parse(args);
  const parameters = parsed.parameters as Record<string, unknown>;

  switch (parsed.task) {
    case 'reindex':
      return await superAdminUtils.reindexResources({ resourceTypes: parameters.resourceTypes as string[] });
    case 'rebuild-compartments':
      return await superAdminUtils.rebuildCompartments({
        resourceType: parameters.resourceType as string,
        id: parameters.id as string,
      });
    case 'purge':
      return await superAdminUtils.purgeResources({
        resourceType: parameters.resourceType as string,
        before: parameters.before as string,
      });
    case 'force-set-password':
      return await superAdminUtils.forceSetPassword({
        userId: parameters.userId as string,
        password: parameters.password as string,
      });
    default:
      throw new Error(`Unknown admin task: ${parsed.task}`);
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
toolMapping['manageFhirCast'] = async (args) => {
  const parsed = schemas.ManageFhirCastSchema.parse(args);
  const parameters = parsed.parameters as Record<string, unknown>;

  switch (parsed.action) {
    case 'publish':
      return await miscUtils.fhircastPublish({
        topic: parameters.topic as string,
        event: parameters.event as Record<string, unknown>,
      });
    case 'subscribe':
      return await fhircastUtils.fhircastSubscribe({
        topic: parameters.topic as string,
        events: parameters.events as string[],
      });
    case 'unsubscribe':
      return await fhircastUtils.fhircastUnsubscribe({
        subscriptionRequest: parameters.subscriptionRequest as string,
      });
    case 'get-context':
      return await fhircastUtils.fhircastGetContext({ topic: parameters.topic as string });
    default:
      throw new Error(`Unknown FHIRcast action: ${parsed.action}`);
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
toolMapping['postBundle'] = (args) => {
  const parsed = schemas.PostBundleSchema.parse(args);
  return transactionUtils.postBundle(parsed as unknown as transactionUtils.PostBundleArgs);
};

// Auth
toolDefinitions.push({
  name: 'whoAmI',
  description: 'Returns the current authenticated user/project membership.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['whoAmI'] = (args) => {
  schemas.WhoAmISchema.parse(args);
  return authUtils.whoAmI();
};

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
toolMapping['inviteUser'] = (args) => {
  const parsed = schemas.InviteUserSchema.parse(args);
  return adminUtils.inviteUser(parsed as unknown as adminUtils.InviteUserArgs);
};

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
toolMapping['addProjectSecret'] = (args) => {
  const parsed = schemas.AddProjectSecretSchema.parse(args);
  return adminUtils.addProjectSecret(parsed as unknown as adminUtils.AddProjectSecretArgs);
};

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
toolMapping['executeBot'] = (args) => {
  const parsed = schemas.ExecuteBotSchema.parse(args);
  return advancedUtils.executeBot(parsed as unknown as advancedUtils.ExecuteBotArgs);
};

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
toolMapping['graphql'] = (args) => {
  const parsed = schemas.GraphqlSchema.parse(args);
  return advancedUtils.graphql(parsed as unknown as advancedUtils.GraphqlArgs);
};

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
toolMapping['pushToAgent'] = (args) => {
  const parsed = schemas.PushToAgentSchema.parse(args);
  return advancedUtils.pushToAgent(parsed as unknown as advancedUtils.PushToAgentArgs);
};

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
toolMapping['bulkExport'] = (args) => {
  const parsed = schemas.BulkExportSchema.parse(args);
  return dataUtils.bulkExport(parsed as unknown as dataUtils.BulkExportArgs);
};

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
toolMapping['bulkImport'] = (args) => {
  const parsed = schemas.BulkImportSchema.parse(args);
  return bulkUtils.bulkImport(parsed as unknown as { url: string });
};

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
toolMapping['readPatientEverything'] = (args) => {
  const parsed = schemas.ReadPatientEverythingSchema.parse(args);
  return dataUtils.readPatientEverything(parsed as unknown as { patientId: string });
};

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
toolMapping['readPatientSummary'] = (args) => {
  const parsed = schemas.ReadPatientSummarySchema.parse(args);
  return dataUtils.readPatientSummary(parsed as unknown as { patientId: string });
};

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
toolMapping['readResourceGraph'] = (args) => {
  const parsed = schemas.ReadResourceGraphSchema.parse(args);
  return dataUtils.readResourceGraph(parsed as unknown as { resourceType: string; id: string });
};

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
toolMapping['requestSchema'] = (args) => {
  const parsed = schemas.RequestSchemaSchema.parse(args);
  return dataUtils.requestSchema(parsed as unknown as { resourceType: string });
};

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
toolMapping['readHistory'] = (args) => {
  const parsed = schemas.ReadHistorySchema.parse(args);
  return versionUtils.readHistory(parsed as unknown as { resourceType: string; id: string });
};

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
toolMapping['readVersion'] = (args) => {
  const parsed = schemas.ReadVersionSchema.parse(args);
  return versionUtils.readVersion(parsed as unknown as { resourceType: string; id: string; vid: string });
};

// Misc Project/User management
toolDefinitions.push({
  name: 'listProjects',
  description: 'Lists all projects accessible to the current user.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['listProjects'] = (args) => {
  schemas.ListProjectsSchema.parse(args);
  return projectUtils.listProjects();
};

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
toolMapping['switchProject'] = (args) => {
  const parsed = schemas.SwitchProjectSchema.parse(args);
  return projectUtils.switchProject(parsed as unknown as { projectId: string });
};

toolDefinitions.push({
  name: 'getHealthCheck',
  description: 'Performs a health check on the Medplum server.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['getHealthCheck'] = (args) => {
  schemas.GetHealthCheckSchema.parse(args);
  return instanceUtils.getHealthCheck();
};

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
toolMapping['sendEmail'] = (args) => {
  const parsed = schemas.SendEmailSchema.parse(args);
  return adminActionUtils.sendEmail(parsed as unknown as adminActionUtils.SendEmailArgs);
};

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
toolMapping['upsertResource'] = (args) => {
  const parsed = schemas.UpsertResourceSchema.parse(args);
  return miscUtils.upsertResource(parsed as unknown as miscUtils.UpsertResourceArgs);
};

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
toolMapping['createComment'] = (args) => {
  const parsed = schemas.CreateCommentSchema.parse(args);
  return miscUtils.createComment(parsed as unknown as miscUtils.CreateCommentArgs);
};

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
toolMapping['startNewProject'] = (args) => {
  const parsed = schemas.StartNewProjectSchema.parse(args);
  return miscUtils.startNewProject(parsed as unknown as miscUtils.StartNewProjectArgs);
};

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
toolMapping['startNewUser'] = (args) => {
  const parsed = schemas.StartNewUserSchema.parse(args);
  return miscUtils.startNewUser(parsed as unknown as miscUtils.StartNewUserArgs);
};

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
toolMapping['startNewPatient'] = (args) => {
  const parsed = schemas.StartNewPatientSchema.parse(args);
  return miscUtils.startNewPatient(parsed as unknown as miscUtils.StartNewPatientArgs);
};

toolDefinitions.push({
  name: 'getProject',
  description: 'Gets the current project details.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['getProject'] = (args) => {
  schemas.GetProjectSchema.parse(args);
  return miscUtils.getProject();
};

toolDefinitions.push({
  name: 'getProfile',
  description: 'Gets the current user profile.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['getProfile'] = (args) => {
  schemas.GetProfileSchema.parse(args);
  return miscUtils.getProfile();
};

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
toolMapping['createResourceIfNoneExist'] = (args) => {
  const parsed = schemas.CreateResourceIfNoneExistSchema.parse(args);
  return miscUtils.createResourceIfNoneExist(parsed as unknown as miscUtils.CreateResourceIfNoneExistArgs);
};

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
toolMapping['createMedia'] = (args) => {
  const parsed = schemas.CreateMediaSchema.parse(args);
  return miscUtils.createMedia(parsed as unknown as miscUtils.CreateMediaArgs);
};

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
toolMapping['createAttachment'] = (args) => {
  const parsed = schemas.CreateAttachmentSchema.parse(args);
  return miscUtils.createAttachment(parsed as unknown as miscUtils.CreateAttachmentArgs);
};

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
toolMapping['uploadMedia'] = (args) => {
  const parsed = schemas.UploadMediaSchema.parse(args);
  return miscUtils.uploadMedia(parsed as unknown as miscUtils.UploadMediaArgs);
};
