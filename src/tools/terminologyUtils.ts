import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Parameters } from '@medplum/fhirtypes';

export async function subsumes(args: { system: string; codeA: string; codeB: string }): Promise<Parameters> {
  await ensureAuthenticated();
  return medplum.post(medplum.fhirUrl('CodeSystem', '$subsumes'), {
    system: args.system,
    codeA: args.codeA,
    codeB: args.codeB,
  });
}

export async function translate(args: {
  url: string; // ConceptMap URL
  system: string;
  code: string;
  source?: string;
  target?: string;
}): Promise<Parameters> {
  await ensureAuthenticated();
  return medplum.post(medplum.fhirUrl('ConceptMap', '$translate'), {
    url: args.url,
    system: args.system,
    code: args.code,
    source: args.source,
    target: args.target,
  });
}
