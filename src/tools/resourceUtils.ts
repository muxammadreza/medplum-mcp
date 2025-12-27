/**
 * Unified Resource Management Tool
 * Consolidates: createResource, getResource, updateResource, deleteResource, searchResource, patchResource
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Resource, ResourceType, OperationOutcome, Bundle } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type ResourceAction = 'create' | 'read' | 'update' | 'delete' | 'search' | 'patch' | 'upsert';

export interface ManageResourceArgs {
  action: ResourceAction;
  resourceType: string;
  id?: string;
  resource?: Record<string, unknown>;
  searchParams?: Record<string, string | number | boolean | string[]>;
  patch?: Array<Record<string, unknown>>;
  upsertSearch?: Record<string, unknown>;
}

export interface ResourceResult {
  success: boolean;
  action: ResourceAction;
  resourceType: string;
  resource?: Resource | null;
  resources?: Resource[];
  error?: string;
  total?: number;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function manageResource(args: ManageResourceArgs): Promise<ResourceResult> {
  await ensureAuthenticated();

  const { action, resourceType, id, resource, searchParams, patch, upsertSearch } = args;

  try {
    switch (action) {
      case 'create':
        return await createResource(resourceType, resource);
      case 'read':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for read action' };
        }
        return await readResource(resourceType, id);
      case 'update':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for update action' };
        }
        return await updateResource(resourceType, id, resource);
      case 'delete':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for delete action' };
        }
        return await deleteResource(resourceType, id);
      case 'search':
        return await searchResources(resourceType, searchParams || {});
      case 'patch':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for patch action' };
        }
        if (!patch) {
          return { success: false, action, resourceType, error: 'Patch operations are required for patch action' };
        }
        return await patchResource(resourceType, id, patch);
      case 'upsert':
        return await upsertResource(resourceType, resource, upsertSearch);
      default:
        return {
          success: false,
          action,
          resourceType,
          error: `Unknown action: ${action}. Valid: create, read, update, delete, search, patch, upsert`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, action, resourceType, error: errorMessage };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function createResource(
  resourceType: string,
  resource?: Record<string, unknown>
): Promise<ResourceResult> {
  if (!resource) {
    return { success: false, action: 'create', resourceType, error: 'Resource data is required' };
  }
  const result = await medplum.createResource({ ...resource, resourceType } as Resource);
  return { success: true, action: 'create', resourceType, resource: result };
}

async function readResource(resourceType: string, id: string): Promise<ResourceResult> {
  try {
    const result = await medplum.readResource(resourceType as ResourceType, id);
    return { success: true, action: 'read', resourceType, resource: result };
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return { success: true, action: 'read', resourceType, resource: null };
    }
    throw error;
  }
}

async function updateResource(
  resourceType: string,
  id: string,
  resource?: Record<string, unknown>
): Promise<ResourceResult> {
  if (!resource) {
    return { success: false, action: 'update', resourceType, error: 'Resource data is required' };
  }
  const existing = await medplum.readResource(resourceType as ResourceType, id);
  const updated = { ...existing, ...resource, resourceType, id };
  const result = await medplum.updateResource(updated as Resource);
  return { success: true, action: 'update', resourceType, resource: result };
}

async function deleteResource(resourceType: string, id: string): Promise<ResourceResult> {
  await medplum.deleteResource(resourceType as ResourceType, id);
  return { success: true, action: 'delete', resourceType };
}

async function searchResources(
  resourceType: string,
  searchParams: Record<string, string | number | boolean | string[]>
): Promise<ResourceResult> {
  const queryString = new URLSearchParams(
    Object.entries(searchParams).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value.join(',') : String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const bundle = (await medplum.search(resourceType as ResourceType, queryString)) as Bundle;
  const resources = (bundle.entry?.map((e) => e.resource).filter(Boolean) || []) as Resource[];

  return {
    success: true,
    action: 'search',
    resourceType,
    resources,
    total: bundle.total ?? resources.length,
  };
}

async function patchResource(
  resourceType: string,
  id: string,
  patch: Array<Record<string, unknown>>
): Promise<ResourceResult> {
  const result = await medplum.patchResource(resourceType as ResourceType, id, patch as any);
  return { success: true, action: 'patch', resourceType, resource: result };
}

async function upsertResource(
  resourceType: string,
  resource?: Record<string, unknown>,
  search?: Record<string, unknown>
): Promise<ResourceResult> {
  if (!resource) {
    return { success: false, action: 'upsert', resourceType, error: 'Resource data is required' };
  }
  const result = await medplum.upsertResource({ ...resource, resourceType } as Resource, search as any);
  return { success: true, action: 'upsert', resourceType, resource: result };
}

// Helper
function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'outcome' in error &&
    (error as { outcome?: OperationOutcome }).outcome?.issue?.[0]?.code === 'not-found'
  );
}
