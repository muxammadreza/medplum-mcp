import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { MailOptions } from '@medplum/core';
import { OperationOutcome, Binary } from '@medplum/fhirtypes';

export async function sendEmail(args: MailOptions): Promise<OperationOutcome> {
  await ensureAuthenticated();
  return medplum.sendEmail(args);
}

export async function resendSubscription(args: { subscriptionId: string }): Promise<OperationOutcome> {
  await ensureAuthenticated();
  return medplum.post(medplum.fhirUrl('Subscription', args.subscriptionId, '$resend'), {});
}

export async function rotateClientSecret(args: { clientId: string }): Promise<OperationOutcome> {
  await ensureAuthenticated();
  return medplum.post(medplum.fhirUrl('ClientApplication', args.clientId, '$rotate-secret'), {});
}

export async function ccdaExport(args: { patientId: string }): Promise<Binary> {
  await ensureAuthenticated();
  // C-CDA export is typically GET /Patient/:id/$ccda
  return medplum.get(medplum.fhirUrl('Patient', args.patientId, '$ccda'));
}
