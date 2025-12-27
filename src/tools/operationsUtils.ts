import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { OperationOutcome, Parameters } from '@medplum/fhirtypes';

export interface ValidateResourceArgs {
  resourceType: string;
  resource: any;
}

export async function validateResource(args: ValidateResourceArgs): Promise<OperationOutcome> {
  await ensureAuthenticated();
  return medplum.validateResource(args.resource);
}

// Terminology operations

export interface ValueSetExpandArgs {
  url: string;
  filter?: string;
}

export async function expandValueSet(args: ValueSetExpandArgs): Promise<any> {
  await ensureAuthenticated();
  const url = new URL('ValueSet/$expand', medplum.getBaseUrl());
  url.searchParams.set('url', args.url);
  if (args.filter) url.searchParams.set('filter', args.filter);

  return medplum.get(url.toString());
}

export interface CodeSystemLookupArgs {
  system: string;
  code: string;
}

export async function lookupCode(args: CodeSystemLookupArgs): Promise<Parameters> {
  await ensureAuthenticated();
  // GET /CodeSystem/$lookup?system=...&code=...
  const url = new URL('CodeSystem/$lookup', medplum.getBaseUrl());
  url.searchParams.set('system', args.system);
  url.searchParams.set('code', args.code);
  return medplum.get(url.toString());
}

export interface CodeSystemValidateCodeArgs {
  system: string;
  code: string;
  display?: string;
}

export async function validateCode(args: CodeSystemValidateCodeArgs): Promise<Parameters> {
  await ensureAuthenticated();
  // GET /CodeSystem/$validate-code?system=...&code=...
  const url = new URL('CodeSystem/$validate-code', medplum.getBaseUrl());
  url.searchParams.set('system', args.system);
  url.searchParams.set('code', args.code);
  if (args.display) url.searchParams.set('display', args.display);
  return medplum.get(url.toString());
}
