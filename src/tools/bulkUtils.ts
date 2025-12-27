import { medplum } from '../config/medplumClient';
import { BulkDataExport } from '@medplum/fhirtypes';

export async function bulkImport(args: { url: string }): Promise<any> {
  // $import is an operation on the root of the server
  // POST /$import
  // Body: { "resourceType": "Parameters", "parameter": [ { "name": "inputFormat", "valueCode": "application/fhir+ndjson" }, { "name": "inputSource", "valueUri": url }, { "name": "inputType", "valueCode": "Patient" } ] }
  // Medplum has a helper for this? Not explicitly in the client methods list, so we might need to use `executeBot` style generic operation call or `post`.
  // The MedplumClient `post` method takes a URL string.

  // Actually, checking the docs or `medplum.ts` source again for `$import`.
  // It seems `bulkImport` isn't a direct method on `MedplumClient` (unlike `bulkExport`).
  // So we construct the request manually.

  const parameters = {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'inputFormat',
        valueCode: 'application/fhir+ndjson',
      },
      {
        name: 'inputSource',
        valueUri: args.url,
      },
      {
        name: 'storageType',
        valueCode: 'https',
      },
    ],
  };

  return medplum.post(medplum.fhirUrl('$import'), parameters);
}
