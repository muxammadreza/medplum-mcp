/**
 * Unified Version/History Tool
 * Consolidates: readHistory, readVersion
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bundle, Resource, ResourceType } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type HistoryAction = 'list' | 'read-version';

export interface ManageHistoryArgs {
  action: HistoryAction;
  resourceType: string;
  id: string;
  versionId?: string;
}

export interface HistoryResult {
  success: boolean;
  action: HistoryAction;
  resourceType: string;
  id: string;
  data?: Bundle | Resource | unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function manageHistory(args: ManageHistoryArgs): Promise<HistoryResult> {
  await ensureAuthenticated();

  const { action, resourceType, id, versionId } = args;

  if (!resourceType || !id) {
    return {
      success: false,
      action,
      resourceType: resourceType || '',
      id: id || '',
      error: 'resourceType and id are required',
    };
  }

  try {
    switch (action) {
      case 'list':
        return await listHistory(resourceType, id);
      case 'read-version':
        if (!versionId) {
          return { success: false, action, resourceType, id, error: 'versionId is required for read-version' };
        }
        return await readVersion(resourceType, id, versionId);
      default:
        return {
          success: false,
          action,
          resourceType,
          id,
          error: `Unknown action: ${action}. Valid: list, read-version`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, action, resourceType, id, error: errorMessage };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function listHistory(resourceType: string, id: string): Promise<HistoryResult> {
  const result = await medplum.readHistory(resourceType as ResourceType, id);
  return { success: true, action: 'list', resourceType, id, data: result };
}

async function readVersion(
  resourceType: string,
  id: string,
  versionId: string
): Promise<HistoryResult> {
  const result = await medplum.readVersion(resourceType as ResourceType, id, versionId);
  return { success: true, action: 'read-version', resourceType, id, data: result };
}
