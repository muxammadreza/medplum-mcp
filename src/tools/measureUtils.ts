import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { MeasureReport } from '@medplum/fhirtypes';

export async function evaluateMeasure(args: {
  measureId: string;
  periodStart: string;
  periodEnd: string;
  subject?: string;
  reportType?: 'individual' | 'subject-list' | 'summary';
}): Promise<MeasureReport> {
  await ensureAuthenticated();
  return medplum.post(medplum.fhirUrl('Measure', args.measureId, '$evaluate-measure'), {
    periodStart: args.periodStart,
    periodEnd: args.periodEnd,
    subject: args.subject,
    reportType: args.reportType,
  });
}
