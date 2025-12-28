/**
 * Medplum MCP Server - Consolidated Tool Registry
 * 
 * Following 2024-2025 MCP best practices for tool consolidation.
 * Reduced from 48 tools to ~17 unified tools using action-parameter patterns.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import consolidated utils
import { manageResource } from './resourceUtils';
import { manageClinicalReport } from './clinicalReportUtils';
import { manageAutomation } from './automationUtils';
import { patientData } from './patientDataUtils';
import { manageProject } from './projectManagementUtils';
import { manageMedia } from './mediaUtils';
import { startNew } from './startNewUtils';
import { manageHistory } from './historyUtils';
import { terminology } from './terminologyConsolidatedUtils';
import { bulkData } from './bulkDataUtils';

// Import remaining standalone utils
import { medplum, ensureAuthenticated } from '../config/medplumClient';

// ============================================================================
// EXPORTS
// ============================================================================

export const toolDefinitions: Tool[] = [];
export const toolMapping: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {};

// ============================================================================
// SCHEMAS
// ============================================================================

const ManageResourceSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete', 'search', 'patch', 'upsert']),
  resourceType: z.string(),
  id: z.string().optional(),
  resource: z.record(z.string(), z.unknown()).optional(),
  searchParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  patch: z.array(z.record(z.string(), z.unknown())).optional(),
  upsertSearch: z.record(z.string(), z.unknown()).optional(),
});

const ManageClinicalReportSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete', 'search']),
  resourceType: z.enum(['DiagnosticReport', 'Procedure']),
  id: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  searchParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
});

const ManageAutomationSchema = z.object({
  action: z.enum([
    'deploy-bot', 'execute-bot', 'create-bot',
    'create-subscription', 'get-subscription', 'update-subscription', 'delete-subscription',
    'reload-agent',
  ]),
  botId: z.string().optional(),
  botCode: z.string().optional(),
  botFilename: z.string().optional(),
  botInput: z.record(z.string(), z.unknown()).optional(),
  botName: z.string().optional(),
  botDescription: z.string().optional(),
  subscriptionId: z.string().optional(),
  subscriptionCriteria: z.string().optional(),
  subscriptionEndpoint: z.string().optional(),
  subscriptionReason: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'off', 'error']).optional(),
  agentId: z.string().optional(),
});

const PatientDataSchema = z.object({
  action: z.enum(['everything', 'summary', 'ccda']),
  patientId: z.string(),
});

const ManageProjectSchema = z.object({
  action: z.enum(['list', 'switch', 'get', 'get-profile', 'invite', 'add-secret']),
  projectId: z.string().optional(),
  email: z.string().optional(),
  resourceType: z.enum(['Patient', 'Practitioner', 'RelatedPerson']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  sendEmail: z.boolean().optional(),
  admin: z.boolean().optional(),
  secretName: z.string().optional(),
  secretValue: z.string().optional(),
});

const ManageMediaSchema = z.object({
  action: z.enum(['create-media', 'create-attachment', 'upload']),
  content: z.record(z.string(), z.unknown()).optional(),
  data: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  contentType: z.string(),
  filename: z.string().optional(),
});

const StartNewSchema = z.object({
  type: z.enum(['project', 'user', 'patient']),
  login: z.string().optional(),
  projectName: z.string().optional(),
  user: z.record(z.string(), z.unknown()).optional(),
  patient: z.record(z.string(), z.unknown()).optional(),
});

const ManageHistorySchema = z.object({
  action: z.enum(['list', 'read-version']),
  resourceType: z.string(),
  id: z.string(),
  versionId: z.string().optional(),
});

const TerminologySchema = z.object({
  action: z.enum(['subsumes', 'translate', 'lookup', 'validate-code']),
  system: z.string().optional(),
  code: z.string().optional(),
  codeA: z.string().optional(),
  codeB: z.string().optional(),
  conceptMapUrl: z.string().optional(),
  source: z.string().optional(),
  target: z.string().optional(),
  url: z.string().optional(),
});

const BulkDataSchema = z.object({
  action: z.enum(['export', 'import']),
  resourceTypes: z.array(z.string()).optional(),
  since: z.string().optional(),
  outputFormat: z.string().optional(),
  url: z.string().optional(),
});

// ============================================================================
// TOOL 1: manageResource
// ============================================================================

toolDefinitions.push({
  name: 'manageResource',
  description: `Perform CRUD operations on any FHIR resource type.

ACTIONS:
- create: Create a new resource
- read: Get a resource by ID
- update: Update an existing resource (merge with existing)
- delete: Delete a resource by ID
- search: Search resources with query parameters
- patch: Apply JSON patch operations
- upsert: Create or update based on search criteria

EXAMPLES:
- Create Patient: action="create", resourceType="Patient", resource={name: [{given: ["John"], family: "Doe"}]}
- Search: action="search", resourceType="Observation", searchParams={patient: "Patient/123", status: "final"}
- Update: action="update", resourceType="Patient", id="123", resource={birthDate: "1990-01-15"}

SUPPORTED: All 140+ FHIR R4 resource types.`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'search', 'patch', 'upsert'] },
      resourceType: { type: 'string', description: 'FHIR resource type (e.g., Patient, Observation)' },
      id: { type: 'string', description: 'Resource ID (for read/update/delete/patch)' },
      resource: { type: 'object', description: 'Resource data (for create/update/upsert)' },
      searchParams: { type: 'object', description: 'Search parameters (for search)' },
      patch: { type: 'array', description: 'JSON Patch operations (for patch)' },
      upsertSearch: { type: 'object', description: 'Search criteria for upsert' },
    },
    required: ['action', 'resourceType'],
  },
});
toolMapping['manageResource'] = (args) => manageResource(ManageResourceSchema.parse(args));

// ============================================================================
// TOOL 2: manageClinicalReport
// ============================================================================

toolDefinitions.push({
  name: 'manageClinicalReport',
  description: `Manage clinical reports: DiagnosticReport and Procedure resources.

ACTIONS: create, read, update, delete, search

EXAMPLES:
- Create DiagnosticReport: action="create", resourceType="DiagnosticReport", data={status: "final", code: {text: "CBC"}}
- Search Procedures: action="search", resourceType="Procedure", searchParams={patient: "Patient/123"}`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'search'] },
      resourceType: { type: 'string', enum: ['DiagnosticReport', 'Procedure'] },
      id: { type: 'string' },
      data: { type: 'object' },
      searchParams: { type: 'object' },
    },
    required: ['action', 'resourceType'],
  },
});
toolMapping['manageClinicalReport'] = (args) => manageClinicalReport(ManageClinicalReportSchema.parse(args));

// ============================================================================
// TOOL 3: manageAutomation
// ============================================================================

toolDefinitions.push({
  name: 'manageAutomation',
  description: `Manage automation: Bots, Subscriptions, and Agents.

BOT ACTIONS:
- deploy-bot: Deploy code (requires botId, botCode)
- execute-bot: Run a bot (requires botId)
- create-bot: Create new bot (requires botName)

SUBSCRIPTION ACTIONS:
- create-subscription: Create webhook (requires subscriptionCriteria, subscriptionEndpoint)
- get-subscription, update-subscription, delete-subscription

AGENT ACTIONS:
- reload-agent: Reload config (requires agentId)`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['deploy-bot', 'execute-bot', 'create-bot', 'create-subscription', 'get-subscription', 'update-subscription', 'delete-subscription', 'reload-agent'] },
      botId: { type: 'string' },
      botCode: { type: 'string' },
      botFilename: { type: 'string' },
      botInput: { type: 'object' },
      botName: { type: 'string' },
      botDescription: { type: 'string' },
      subscriptionId: { type: 'string' },
      subscriptionCriteria: { type: 'string' },
      subscriptionEndpoint: { type: 'string' },
      subscriptionReason: { type: 'string' },
      subscriptionStatus: { type: 'string', enum: ['active', 'off', 'error'] },
      agentId: { type: 'string' },
    },
    required: ['action'],
  },
});
toolMapping['manageAutomation'] = (args) => manageAutomation(ManageAutomationSchema.parse(args));

// ============================================================================
// TOOL 4: patientData
// ============================================================================

toolDefinitions.push({
  name: 'patientData',
  description: `Get patient data in various formats.

ACTIONS:
- everything: Get all resources for a patient ($everything)
- summary: Get patient summary (demographics, conditions, medications, recent observations)
- ccda: Export patient data as C-CDA document`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['everything', 'summary', 'ccda'] },
      patientId: { type: 'string', description: 'Patient resource ID' },
    },
    required: ['action', 'patientId'],
  },
});
toolMapping['patientData'] = (args) => patientData(PatientDataSchema.parse(args));

// ============================================================================
// TOOL 5: manageProject
// ============================================================================

toolDefinitions.push({
  name: 'manageProject',
  description: `Manage Medplum projects and users.

ACTIONS:
- list: List all accessible projects
- switch: Switch to a different project
- get: Get current project details
- get-profile: Get current user profile
- invite: Invite a user to the project
- add-secret: Add/update a project secret`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['list', 'switch', 'get', 'get-profile', 'invite', 'add-secret'] },
      projectId: { type: 'string' },
      email: { type: 'string' },
      resourceType: { type: 'string', enum: ['Patient', 'Practitioner', 'RelatedPerson'] },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      sendEmail: { type: 'boolean' },
      admin: { type: 'boolean' },
      secretName: { type: 'string' },
      secretValue: { type: 'string' },
    },
    required: ['action'],
  },
});
toolMapping['manageProject'] = (args) => manageProject(ManageProjectSchema.parse(args));

// ============================================================================
// TOOL 6: manageMedia
// ============================================================================

toolDefinitions.push({
  name: 'manageMedia',
  description: `Manage media and attachments.

ACTIONS:
- create-media: Create a Media resource
- create-attachment: Create an Attachment object
- upload: Upload binary data`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['create-media', 'create-attachment', 'upload'] },
      content: { type: 'object' },
      data: { type: 'string' },
      contentType: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['action', 'contentType'],
  },
});
toolMapping['manageMedia'] = (args) => manageMedia(ManageMediaSchema.parse(args));

// ============================================================================
// TOOL 7: startNew
// ============================================================================

toolDefinitions.push({
  name: 'startNew',
  description: `Create new projects, users, or patients.

TYPES:
- project: Create a new project (requires login, projectName)
- user: Create a new user (requires user object)
- patient: Create a new patient with onboarding (requires patient object)`,
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['project', 'user', 'patient'] },
      login: { type: 'string' },
      projectName: { type: 'string' },
      user: { type: 'object' },
      patient: { type: 'object' },
    },
    required: ['type'],
  },
});
toolMapping['startNew'] = (args) => startNew(StartNewSchema.parse(args));

// ============================================================================
// TOOL 8: manageHistory
// ============================================================================

toolDefinitions.push({
  name: 'manageHistory',
  description: `Access resource version history.

ACTIONS:
- list: Get all versions of a resource
- read-version: Get a specific version by versionId`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['list', 'read-version'] },
      resourceType: { type: 'string' },
      id: { type: 'string' },
      versionId: { type: 'string' },
    },
    required: ['action', 'resourceType', 'id'],
  },
});
toolMapping['manageHistory'] = (args) => manageHistory(ManageHistorySchema.parse(args));

// ============================================================================
// TOOL 9: terminology
// ============================================================================

toolDefinitions.push({
  name: 'terminology',
  description: `Terminology operations on code systems and value sets.

ACTIONS:
- subsumes: Check if codeA subsumes codeB
- translate: Translate a code using a ConceptMap
- lookup: Look up code details
- validate-code: Validate a code against a ValueSet`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['subsumes', 'translate', 'lookup', 'validate-code'] },
      system: { type: 'string' },
      code: { type: 'string' },
      codeA: { type: 'string' },
      codeB: { type: 'string' },
      conceptMapUrl: { type: 'string' },
      source: { type: 'string' },
      target: { type: 'string' },
      url: { type: 'string' },
    },
    required: ['action'],
  },
});
toolMapping['terminology'] = (args) => terminology(TerminologySchema.parse(args));

// ============================================================================
// TOOL 10: bulkData
// ============================================================================

toolDefinitions.push({
  name: 'bulkData',
  description: `Bulk data export and import operations.

ACTIONS:
- export: Start a bulk export job (optional: resourceTypes, since, outputFormat)
- import: Import data from a URL`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['export', 'import'] },
      resourceTypes: { type: 'array', items: { type: 'string' } },
      since: { type: 'string' },
      outputFormat: { type: 'string' },
      url: { type: 'string' },
    },
    required: ['action'],
  },
});
toolMapping['bulkData'] = (args) => bulkData(BulkDataSchema.parse(args));

// ============================================================================
// TOOL 11: whoAmI
// ============================================================================

toolDefinitions.push({
  name: 'whoAmI',
  description: 'Returns the current authenticated user/project membership.',
  inputSchema: { type: 'object', properties: {} },
});
toolMapping['whoAmI'] = async () => {
  await ensureAuthenticated();
  return {
    profile: medplum.getProfile(),
    project: await medplum.getProject(),
  };
};

// ============================================================================
// TOOL 12: graphql
// ============================================================================

toolDefinitions.push({
  name: 'graphql',
  description: 'Execute a GraphQL query against the Medplum FHIR server.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'GraphQL query string' },
      operationName: { type: 'string' },
      variables: { type: 'object' },
    },
    required: ['query'],
  },
});
toolMapping['graphql'] = async (args) => {
  await ensureAuthenticated();
  const { query, operationName, variables } = args as { query: string; operationName?: string; variables?: Record<string, unknown> };
  return medplum.graphql(query, operationName, variables);
};

// ============================================================================
// TOOL 13: sendEmail
// ============================================================================

toolDefinitions.push({
  name: 'sendEmail',
  description: 'Send an email using the Medplum Email API.',
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
toolMapping['sendEmail'] = async (args) => {
  await ensureAuthenticated();
  const { to, subject, text, html } = args as { to: string; subject: string; text?: string; html?: string };
  return medplum.sendEmail({ to, subject, text, html });
};

// ============================================================================
// TOOL 14: postBundle
// ============================================================================

toolDefinitions.push({
  name: 'postBundle',
  description: 'Execute a FHIR Bundle (transaction or batch).',
  inputSchema: {
    type: 'object',
    properties: {
      bundle: { type: 'object', description: 'FHIR Bundle resource' },
    },
    required: ['bundle'],
  },
});
toolMapping['postBundle'] = async (args) => {
  await ensureAuthenticated();
  const { bundle } = args as { bundle: Record<string, unknown> };
  return medplum.executeBatch(bundle as any);
};

// ============================================================================
// TOOL 15: executeAdminTask
// ============================================================================

toolDefinitions.push({
  name: 'executeAdminTask',
  description: `Execute administrative tasks (Super Admin only).

TASKS:
- reindex: Reindex resources
- rebuild-compartments: Rebuild patient compartments
- purge: Purge deleted resources
- force-set-password: Set user password`,
  inputSchema: {
    type: 'object',
    properties: {
      task: { type: 'string', enum: ['reindex', 'rebuild-compartments', 'purge', 'force-set-password'] },
      parameters: { type: 'object', description: 'Parameters for the task' },
    },
    required: ['task', 'parameters'],
  },
});
toolMapping['executeAdminTask'] = async (args) => {
  await ensureAuthenticated();
  const { task, parameters } = args as { task: string; parameters: Record<string, unknown> };
  
  switch (task) {
    case 'reindex':
      return medplum.post('admin/super/reindex', parameters);
    case 'rebuild-compartments':
      return medplum.post('admin/super/compartments', parameters);
    case 'purge':
      return medplum.post('admin/super/purge', parameters);
    case 'force-set-password':
      return medplum.post('admin/super/setpassword', parameters);
    default:
      throw new Error(`Unknown admin task: ${task}`);
  }
};

// ============================================================================
// TOOL 16: executeFhirOperation
// ============================================================================

toolDefinitions.push({
  name: 'executeFhirOperation',
  description: `Execute standard FHIR operations.

OPERATIONS:
- validate-resource: Validate a resource against its schema
- expand-valueset: Expand a ValueSet`,
  inputSchema: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['validate-resource', 'expand-valueset'] },
      parameters: { type: 'object' },
    },
    required: ['operation', 'parameters'],
  },
});
toolMapping['executeFhirOperation'] = async (args) => {
  await ensureAuthenticated();
  const { operation, parameters } = args as { operation: string; parameters: Record<string, unknown> };
  
  switch (operation) {
    case 'validate-resource':
      return medplum.validateResource(parameters.resource as any);
    case 'expand-valueset':
      // Use GET request to ValueSet/$expand
      const url = parameters.url as string;
      const filter = parameters.filter as string;
      const expandUrl = `ValueSet/$expand?url=${encodeURIComponent(url)}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`;
      return medplum.get(expandUrl);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};

// ============================================================================
// TOOL 17: manageFhirCast
// ============================================================================

toolDefinitions.push({
  name: 'manageFhirCast',
  description: `Manage FHIRcast subscriptions and events.

ACTIONS:
- publish: Publish an event
- subscribe: Subscribe to events
- unsubscribe: Unsubscribe from events
- get-context: Get current context`,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['publish', 'subscribe', 'unsubscribe', 'get-context'] },
      parameters: { type: 'object' },
    },
    required: ['action', 'parameters'],
  },
});
toolMapping['manageFhirCast'] = async (args) => {
  await ensureAuthenticated();
  const { action, parameters } = args as { action: string; parameters: Record<string, unknown> };
  
  switch (action) {
    case 'publish':
      return medplum.post('fhircast/STU3/hub', parameters);
    case 'subscribe':
    case 'unsubscribe':
    case 'get-context':
      return medplum.post(`fhircast/STU3/${action}`, parameters);
    default:
      throw new Error(`Unknown FHIRcast action: ${action}`);
  }
};

// ============================================================================
// Console output for verification (to stderr)
// ============================================================================

console.error(`[MCP] Registered ${toolDefinitions.length} consolidated tools`);
