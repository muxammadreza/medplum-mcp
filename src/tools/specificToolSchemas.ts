import { z } from 'zod';

export const CreateResourceSchema = z.object({
  resourceType: z.string(),
  resource: z.record(z.string(), z.unknown()), // Generic resource object
});

export const GetResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
});

export const UpdateResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
  updates: z.record(z.string(), z.unknown()),
});

export const DeleteResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
});

export const SearchResourceSchema = z.object({
  resourceType: z.string(),
  queryParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
});

export const PatchResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
  patch: z.array(z.record(z.string(), z.unknown())), // JSON Patch array
});

// FHIR Operations
export const ExecuteFhirOperationSchema = z.object({
  operation: z.enum(['validate-resource', 'expand-valueset', 'lookup-code', 'validate-code']),
  parameters: z.record(z.string(), z.unknown()),
});

// Admin Tasks
export const ExecuteAdminTaskSchema = z.object({
  task: z.enum(['reindex', 'rebuild-compartments', 'purge', 'force-set-password']),
  parameters: z.record(z.string(), z.unknown()),
});

// FHIRcast
export const ManageFhirCastSchema = z.object({
  action: z.enum(['publish', 'subscribe', 'unsubscribe', 'get-context']),
  parameters: z.record(z.string(), z.unknown()),
});

// Transaction
export const PostBundleSchema = z.object({
  bundle: z.record(z.string(), z.unknown()),
});

// Auth
export const WhoAmISchema = z.object({});

// Project Admin
export const InviteUserSchema = z.object({
  projectId: z.string(),
  email: z.string().email(),
  resourceType: z.enum(['Patient', 'Practitioner', 'RelatedPerson']).optional(),
  accessPolicy: z.record(z.string(), z.unknown()).optional(), // Reference<AccessPolicy>
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  sendEmail: z.boolean().optional(),
  admin: z.boolean().optional(),
});

export const AddProjectSecretSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  value: z.string(),
});

// Advanced
export const ExecuteBotSchema = z.object({
  botId: z.string(),
  data: z.union([z.record(z.string(), z.unknown()), z.string()]), // Can be object or string? Utils says 'any'
  contentType: z.string().optional(),
});

export const GraphqlSchema = z.object({
  query: z.string(),
  operationName: z.string().optional(),
  variables: z.record(z.string(), z.unknown()).optional(),
});

export const PushToAgentSchema = z.object({
  agentId: z.string(),
  body: z.string(),
  contentType: z.string().optional(),
  destination: z.string().optional(),
  waitForResponse: z.boolean().optional(),
});

// Data / Bulk
export const BulkExportSchema = z.object({
  resourceTypes: z.array(z.string()).optional(),
  since: z.string().optional(),
  outputFormat: z.string().optional(),
});

export const BulkImportSchema = z.object({
  url: z.string(),
});

export const ReadPatientEverythingSchema = z.object({
  patientId: z.string(),
});

export const ReadPatientSummarySchema = z.object({
  patientId: z.string(),
});

export const ReadResourceGraphSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
});

export const RequestSchemaSchema = z.object({
  resourceType: z.string(),
});

// Versioning
export const ReadHistorySchema = z.object({
  resourceType: z.string(),
  id: z.string(),
});

export const ReadVersionSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
  vid: z.string(),
});

// Misc Project/User
export const ListProjectsSchema = z.object({});

export const SwitchProjectSchema = z.object({
  projectId: z.string(),
});

export const GetHealthCheckSchema = z.object({});

export const SendEmailSchema = z.object({
  to: z.string(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
});

// Misc Helpers
export const UpsertResourceSchema = z.object({
  resource: z.record(z.string(), z.unknown()),
  search: z.record(z.string(), z.unknown()).optional(),
});

export const CreateCommentSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
  text: z.string(),
});

// Start New
export const StartNewProjectSchema = z.object({
  login: z.string(),
  projectName: z.string(),
});

export const StartNewUserSchema = z.object({
  user: z.record(z.string(), z.unknown()),
});

export const StartNewPatientSchema = z.object({
  patient: z.record(z.string(), z.unknown()),
});

export const GetProjectSchema = z.object({});
export const GetProfileSchema = z.object({});

export const CreateResourceIfNoneExistSchema = z.object({
  resource: z.record(z.string(), z.unknown()),
  query: z.string(),
});

// Media
export const CreateMediaSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  contentType: z.string(),
  filename: z.string().optional(),
});

export const CreateAttachmentSchema = z.object({
  data: z.record(z.string(), z.unknown()), // Utils says data: any
  contentType: z.string(),
  filename: z.string().optional(),
});

export const UploadMediaSchema = z.object({
  data: z.record(z.string(), z.unknown()), // Utils says data: any
  contentType: z.string(),
  filename: z.string().optional(),
});

// New Tool Schemas
export const EvaluateMeasureSchema = z.object({
  measureId: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  subject: z.string().optional(),
  reportType: z.enum(['individual', 'subject-list', 'summary']).optional(),
});

export const SubsumesSchema = z.object({
  system: z.string(),
  codeA: z.string(),
  codeB: z.string(),
});

export const TranslateSchema = z.object({
  url: z.string(),
  system: z.string(),
  code: z.string(),
  source: z.string().optional(),
  target: z.string().optional(),
});

export const ExtractSchema = z.object({
  questionnaireResponseId: z.string(),
});

export const ResendSubscriptionSchema = z.object({
  subscriptionId: z.string(),
});

export const RotateClientSecretSchema = z.object({
  clientId: z.string(),
});

export const CcdaExportSchema = z.object({
  patientId: z.string(),
});

// ============================================================================
// NEW CONSOLIDATED TOOL SCHEMAS
// ============================================================================

// Clinical Report Tool (DiagnosticReport, Procedure)
export const ManageClinicalReportSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete', 'search']),
  resourceType: z.enum(['DiagnosticReport', 'Procedure']),
  id: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  searchParams: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
});

// Automation Tool (Bots, Subscriptions, Agents)
export const ManageAutomationSchema = z.object({
  action: z.enum([
    'deploy-bot',
    'execute-bot',
    'create-bot',
    'create-subscription',
    'get-subscription',
    'update-subscription',
    'delete-subscription',
    'reload-agent',
  ]),
  // Bot parameters
  botId: z.string().optional(),
  botCode: z.string().optional(),
  botFilename: z.string().optional(),
  botInput: z.record(z.string(), z.unknown()).optional(),
  botName: z.string().optional(),
  botDescription: z.string().optional(),
  // Subscription parameters
  subscriptionId: z.string().optional(),
  subscriptionCriteria: z.string().optional(),
  subscriptionEndpoint: z.string().optional(),
  subscriptionReason: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'off', 'error']).optional(),
  // Agent parameters
  agentId: z.string().optional(),
});

