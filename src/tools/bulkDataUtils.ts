/**
 * Unified Bulk Data Tool
 * Consolidates: bulkExport, bulkImport
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';

// ============================================================================
// TYPES
// ============================================================================

export type BulkDataAction = 'export' | 'import';

export interface BulkDataArgs {
  action: BulkDataAction;
  // Export params
  resourceTypes?: string[];
  since?: string;
  outputFormat?: string;
  // Import params
  url?: string;
}

export interface BulkDataResult {
  success: boolean;
  action: BulkDataAction;
  data?: unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function bulkData(args: BulkDataArgs): Promise<BulkDataResult> {
  await ensureAuthenticated();

  const { action } = args;

  try {
    switch (action) {
      case 'export':
        return await bulkExport(args);
      case 'import':
        return await bulkImport(args);
      default:
        return {
          success: false,
          action,
          error: `Unknown action: ${action}. Valid: export, import`,
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

async function bulkExport(args: BulkDataArgs): Promise<BulkDataResult> {
  const params: Record<string, string> = {};
  
  if (args.resourceTypes && args.resourceTypes.length > 0) {
    params._type = args.resourceTypes.join(',');
  }
  if (args.since) {
    params._since = args.since;
  }
  if (args.outputFormat) {
    params._outputFormat = args.outputFormat;
  }

  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `$export?${queryString}` : '$export';
  
  const result = await medplum.get(url);
  return { success: true, action: 'export', data: result };
}

async function bulkImport(args: BulkDataArgs): Promise<BulkDataResult> {
  if (!args.url) {
    return { success: false, action: 'import', error: 'url is required for import' };
  }

  const result = await medplum.post('$import', {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'input',
        valueUrl: args.url,
      },
    ],
  });

  return { success: true, action: 'import', data: result };
}
