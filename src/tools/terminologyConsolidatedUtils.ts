/**
 * Unified Terminology Tool
 * Consolidates: subsumes, translate + lookup from executeFhirOperation
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Parameters } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type TerminologyAction = 'subsumes' | 'translate' | 'lookup' | 'validate-code';

export interface TerminologyArgs {
  action: TerminologyAction;
  // Common params
  system?: string;
  code?: string;
  // Subsumes params
  codeA?: string;
  codeB?: string;
  // Translate params
  conceptMapUrl?: string;
  source?: string;
  target?: string;
  // Lookup params
  display?: string;
  // Validate-code params
  url?: string;
}

export interface TerminologyResult {
  success: boolean;
  action: TerminologyAction;
  data?: Parameters | unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function terminology(args: TerminologyArgs): Promise<TerminologyResult> {
  await ensureAuthenticated();

  const { action } = args;

  try {
    switch (action) {
      case 'subsumes':
        return await checkSubsumes(args);
      case 'translate':
        return await translateCode(args);
      case 'lookup':
        return await lookupCode(args);
      case 'validate-code':
        return await validateCode(args);
      default:
        return {
          success: false,
          action,
          error: `Unknown action: ${action}. Valid: subsumes, translate, lookup, validate-code`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, action, error: errorMessage };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function checkSubsumes(args: TerminologyArgs): Promise<TerminologyResult> {
  if (!args.system || !args.codeA || !args.codeB) {
    return { success: false, action: 'subsumes', error: 'system, codeA, and codeB are required' };
  }

  const params = new URLSearchParams({
    system: args.system,
    codeA: args.codeA,
    codeB: args.codeB,
  });

  const result = await medplum.get(`CodeSystem/$subsumes?${params.toString()}`);
  return { success: true, action: 'subsumes', data: result };
}

async function translateCode(args: TerminologyArgs): Promise<TerminologyResult> {
  if (!args.conceptMapUrl || !args.system || !args.code) {
    return { success: false, action: 'translate', error: 'conceptMapUrl, system, and code are required' };
  }

  const params = new URLSearchParams({
    url: args.conceptMapUrl,
    system: args.system,
    code: args.code,
  });
  if (args.source) params.set('source', args.source);
  if (args.target) params.set('target', args.target);

  const result = await medplum.get(`ConceptMap/$translate?${params.toString()}`);
  return { success: true, action: 'translate', data: result };
}

async function lookupCode(args: TerminologyArgs): Promise<TerminologyResult> {
  if (!args.system || !args.code) {
    return { success: false, action: 'lookup', error: 'system and code are required' };
  }

  const params = new URLSearchParams({
    system: args.system,
    code: args.code,
  });

  const result = await medplum.get(`CodeSystem/$lookup?${params.toString()}`);
  return { success: true, action: 'lookup', data: result };
}

async function validateCode(args: TerminologyArgs): Promise<TerminologyResult> {
  if (!args.url || !args.system || !args.code) {
    return { success: false, action: 'validate-code', error: 'url, system, and code are required' };
  }

  const params = new URLSearchParams({
    url: args.url,
    system: args.system,
    code: args.code,
  });

  const result = await medplum.get(`ValueSet/$validate-code?${params.toString()}`);
  return { success: true, action: 'validate-code', data: result };
}
