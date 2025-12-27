import { z } from 'zod';

export const CreateResourceSchema = z.object({
  resourceType: z.string(),
  resource: z.record(z.unknown()), // Generic resource object
});

export const GetResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
});

export const UpdateResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
  updates: z.record(z.unknown()),
});

export const DeleteResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
});

export const SearchResourceSchema = z.object({
  resourceType: z.string(),
  queryParams: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
});

export const PatchResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string(),
  patch: z.array(z.record(z.unknown())), // JSON Patch array
});

// FHIR Operations
export const ExecuteFhirOperationSchema = z.object({
  operation: z.enum(['validate-resource', 'expand-valueset', 'lookup-code', 'validate-code']),
  parameters: z.record(z.unknown()),
});

// Admin Tasks
export const ExecuteAdminTaskSchema = z.object({
  task: z.enum(['reindex', 'rebuild-compartments', 'purge', 'force-set-password']),
  parameters: z.record(z.unknown()),
});

// FHIRcast
export const ManageFhirCastSchema = z.object({
  action: z.enum(['publish', 'subscribe', 'unsubscribe', 'get-context']),
  parameters: z.record(z.unknown()),
});

// Transaction
export const PostBundleSchema = z.object({
  bundle: z.record(z.unknown()),
});

// Auth
export const WhoAmISchema = z.object({});

// Project Admin
export const InviteUserSchema = z.object({
  projectId: z.string(),
  email: z.string().email(),
  resourceType: z.enum(['Patient', 'Practitioner', 'RelatedPerson']).optional(),
  accessPolicy: z.record(z.unknown()).optional(), // Reference<AccessPolicy>
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
  data: z.union([z.record(z.unknown()), z.string()]), // Can be object or string? Utils says 'any'
  contentType: z.string().optional(),
});

export const GraphqlSchema = z.object({
  query: z.string(),
  operationName: z.string().optional(),
  variables: z.record(z.unknown()).optional(),
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
  resource: z.record(z.unknown()),
  search: z.record(z.unknown()).optional(),
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
  user: z.record(z.unknown()),
});

export const StartNewPatientSchema = z.object({
  patient: z.record(z.unknown()),
});

export const GetProjectSchema = z.object({});
export const GetProfileSchema = z.object({});

export const CreateResourceIfNoneExistSchema = z.object({
  resource: z.record(z.unknown()),
  query: z.string(),
});

// Media
export const CreateMediaSchema = z.object({
  content: z.record(z.unknown()),
  contentType: z.string(),
  filename: z.string().optional(),
});

export const CreateAttachmentSchema = z.object({
  data: z.record(z.unknown()), // Utils says data: any
  contentType: z.string(),
  filename: z.string().optional(),
});

export const UploadMediaSchema = z.object({
  data: z.record(z.unknown()), // Utils says data: any
  contentType: z.string(),
  filename: z.string().optional(),
});
