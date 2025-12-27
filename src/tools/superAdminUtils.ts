import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { OperationOutcome, ResourceType } from '@medplum/fhirtypes';

export interface ReindexResourcesArgs {
  resourceTypes?: ResourceType[];
}

export async function reindexResources(args: ReindexResourcesArgs): Promise<OperationOutcome> {
  await ensureAuthenticated();
  // Assuming POST /admin/super/reindex
  // Body: { resourceTypes: [...] }
  return medplum.post('admin/super/reindex', args) as Promise<OperationOutcome>;
}

export interface RebuildCompartmentsArgs {
  resourceType: ResourceType;
  id: string;
}

export async function rebuildCompartments(args: RebuildCompartmentsArgs): Promise<OperationOutcome> {
  await ensureAuthenticated();
  // Assuming POST /admin/super/rebuild-compartments
  return medplum.post('admin/super/rebuild-compartments', args) as Promise<OperationOutcome>;
}

export interface PurgeResourcesArgs {
  resourceType: ResourceType;
  before: string; // ISO Date
}

export async function purgeResources(args: PurgeResourcesArgs): Promise<OperationOutcome> {
  await ensureAuthenticated();
  return medplum.post('admin/super/purge', args) as Promise<OperationOutcome>;
}

export interface ForceSetPasswordArgs {
  userId: string;
  password: string;
}

export async function forceSetPassword(args: ForceSetPasswordArgs): Promise<OperationOutcome> {
  await ensureAuthenticated();
  return medplum.post('admin/super/setpassword', {
    user: { reference: `User/${args.userId}` },
    password: args.password,
  }) as Promise<OperationOutcome>;
}
