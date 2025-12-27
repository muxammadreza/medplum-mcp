import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bundle, Resource, ResourceType } from '@medplum/fhirtypes';

export interface ReadHistoryArgs {
  resourceType: ResourceType;
  id: string;
}

export async function readHistory(args: ReadHistoryArgs): Promise<Bundle> {
  await ensureAuthenticated();
  return medplum.readHistory(args.resourceType, args.id);
}

export interface ReadVersionArgs {
  resourceType: ResourceType;
  id: string;
  vid: string;
}

export async function readVersion(args: ReadVersionArgs): Promise<Resource> {
  await ensureAuthenticated();
  return medplum.readVersion(args.resourceType, args.id, args.vid);
}
