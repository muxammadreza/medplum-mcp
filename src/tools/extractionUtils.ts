import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bundle } from '@medplum/fhirtypes';

export async function extract(args: { questionnaireResponseId: string }): Promise<Bundle> {
  await ensureAuthenticated();
  return medplum.post(medplum.fhirUrl('QuestionnaireResponse', args.questionnaireResponseId, '$extract'), {});
}
