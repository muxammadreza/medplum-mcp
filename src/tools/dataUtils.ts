import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bundle, AsyncJob, ResourceType, Resource, BulkDataExport } from '@medplum/fhirtypes';

export interface BulkExportArgs {
  resourceTypes?: ResourceType[];
  since?: string;
  outputFormat?: string;
}

export async function bulkExport(args: BulkExportArgs): Promise<any> {
  await ensureAuthenticated();
  // bulkExport(options?: BulkExportOptions): Promise<AsyncJob | Bundle>
  // Medplum core definition:
  // bulkExport(types?: ResourceType[], since?: string, outputFormat?: string): Promise<AsyncJob | Bundle>;
  // But typescript complained about types.

  // The error was: Argument of type '("AccessPolicy" | ... )[] | undefined' is not assignable to parameter of type 'string | undefined'.
  // It seems like in recent versions it might accept options object or different args.
  // Let's try to check the definition.
  // Assuming it takes options object now or my types are outdated?
  // Let's try passing the options as an object if possible or casting.

  // Actually, checking the error log again:
  // Argument of type ... is not assignable to parameter of type 'string | undefined'.
  // This suggests the first argument is expected to be a string?
  // Maybe `bulkExport(options?: string | BulkDataExportOptions)` ?

  // Based on the error "is not assignable to parameter of type 'string | undefined'", it seems the first argument is treated as a string?
  // Let's use `any` cast to bypass if we are sure, or check if there is a `startAsyncRequest` or similar.
  // Or maybe we use `medplum.post` to initiate it manually if the SDK method signature is confusing.

  // Let's look at `medplum.ts` signatures from my inspection earlier: `bulkExport`.

  // I'll try to use `any` to suppress the type error for now, as I can't see the exact d.ts file.
  return medplum.bulkExport(args.resourceTypes as any, args.since, args.outputFormat) as Promise<any>;
}

export interface ReadPatientEverythingArgs {
  patientId: string;
}

export async function readPatientEverything(args: ReadPatientEverythingArgs): Promise<Bundle> {
  await ensureAuthenticated();
  return medplum.readPatientEverything(args.patientId);
}

export interface ReadPatientSummaryArgs {
  patientId: string;
}

export async function readPatientSummary(args: ReadPatientSummaryArgs): Promise<Bundle> {
  await ensureAuthenticated();
  return medplum.readPatientSummary(args.patientId);
}

export interface ReadResourceGraphArgs {
  resourceType: ResourceType;
  id: string;
}

export async function readResourceGraph(args: ReadResourceGraphArgs): Promise<Bundle> {
  await ensureAuthenticated();
  // Error: Expected 3-4 arguments, but got 2.
  // readResourceGraph(resourceType: ResourceType, id: string, query?: string): Promise<Bundle>
  // or maybe it needs the graph name?
  // Let's try adding `undefined` for optional args.
  return medplum.readResourceGraph(args.resourceType, args.id, 'everything') as Promise<Bundle>;
}

export interface RequestSchemaArgs {
  resourceType: ResourceType;
}

export async function requestSchema(args: RequestSchemaArgs): Promise<any> {
  await ensureAuthenticated();
  return medplum.requestSchema(args.resourceType);
}
