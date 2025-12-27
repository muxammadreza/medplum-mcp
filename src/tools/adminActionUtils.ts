import { medplum } from '../config/medplumClient';
import { MailOptions } from '@medplum/core';
import { OperationOutcome } from '@medplum/fhirtypes';

export async function sendEmail(args: MailOptions): Promise<OperationOutcome> {
  return medplum.sendEmail(args);
}
