import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bundle, OperationOutcome } from '@medplum/fhirtypes';

export interface PostBundleArgs {
  bundle: Bundle;
}

export async function postBundle(args: PostBundleArgs): Promise<Bundle | OperationOutcome> {
  await ensureAuthenticated();
  return medplum.executeBatch(args.bundle);
}
