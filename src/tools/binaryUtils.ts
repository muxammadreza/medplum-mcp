import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Binary, OperationOutcome } from '@medplum/fhirtypes';

export interface CreateBinaryArgs {
  data: string; // Base64 encoded data
  contentType: string;
  filename?: string;
}

export interface GetBinaryArgs {
  binaryId: string;
}

export async function createBinary(args: CreateBinaryArgs): Promise<Binary | OperationOutcome> {
  await ensureAuthenticated();
  // Medplum SDK handles binary creation via createResource if we pass resourceType 'Binary'
  // But strictly `createBinary` helper in SDK uploads the content.
  // `medplum.createBinary(data, filename, contentType)`
  // But `data` in SDK expects Blob or string?
  // Let's check MedplumClient definition.
  // Assuming `medplum.createBinary` takes (data: any, filename?: string, contentType?: string).
  // If we receive base64, we might need to convert it or pass it.

  // Actually, standard FHIR Binary resource has `data` field (base64) and `contentType`.
  // If we use `createResource`, we can just pass the JSON.

  const binary: Binary = {
    resourceType: 'Binary',
    contentType: args.contentType,
    data: args.data, // Base64 string
  };

  // We can just use createResource
  return medplum.createResource(binary);
}

export async function getBinaryById(args: GetBinaryArgs): Promise<Binary | null> {
  await ensureAuthenticated();
  try {
    return await medplum.readResource('Binary', args.binaryId);
  } catch (error: any) {
    if (error.outcome?.issue?.[0]?.code === 'not-found') {
      return null;
    }
    throw error;
  }
}

// Download binary content?
// Usually we return the Binary resource which has the data.
// If the user wants the raw stream, that's harder in MCP JSON response.
// So returning the Binary resource with base64 data is sufficient.
