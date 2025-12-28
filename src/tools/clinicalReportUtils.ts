import { medplum, ensureAuthenticated } from '../config/medplumClient';
import {
  DiagnosticReport,
  Procedure,
  OperationOutcome,
  Bundle,
  ResourceType,
} from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type ClinicalReportResourceType = 'DiagnosticReport' | 'Procedure';
export type ClinicalReportAction = 'create' | 'read' | 'update' | 'search' | 'delete';

export interface ManageClinicalReportArgs {
  action: ClinicalReportAction;
  resourceType: ClinicalReportResourceType;
  id?: string;
  data?: Partial<DiagnosticReport> | Partial<Procedure>;
  searchParams?: Record<string, string | number | boolean | string[]>;
}

export interface ClinicalReportResult {
  success: boolean;
  action: ClinicalReportAction;
  resourceType: ClinicalReportResourceType;
  resource?: DiagnosticReport | Procedure | null;
  resources?: (DiagnosticReport | Procedure)[];
  error?: string;
  total?: number;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

/**
 * Unified tool for managing DiagnosticReport and Procedure resources.
 * Consolidates CRUD operations into a single tool with action parameter.
 */
export async function manageClinicalReport(
  args: ManageClinicalReportArgs
): Promise<ClinicalReportResult> {
  await ensureAuthenticated();

  const { action, resourceType, id, data, searchParams } = args;

  try {
    switch (action) {
      case 'create':
        return await createClinicalReport(resourceType, data);
      case 'read':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for read action' };
        }
        return await readClinicalReport(resourceType, id);
      case 'update':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for update action' };
        }
        return await updateClinicalReport(resourceType, id, data);
      case 'delete':
        if (!id) {
          return { success: false, action, resourceType, error: 'ID is required for delete action' };
        }
        return await deleteClinicalReport(resourceType, id);
      case 'search':
        return await searchClinicalReports(resourceType, searchParams || {});
      default:
        return {
          success: false,
          action,
          resourceType,
          error: `Unknown action: ${action}. Valid actions: create, read, update, delete, search`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      action,
      resourceType,
      error: errorMessage,
    };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function createClinicalReport(
  resourceType: ClinicalReportResourceType,
  data?: Partial<DiagnosticReport> | Partial<Procedure>
): Promise<ClinicalReportResult> {
  if (!data) {
    return {
      success: false,
      action: 'create',
      resourceType,
      error: 'Data is required for create action',
    };
  }

  const resourceToCreate = { ...data, resourceType };
  const result = await medplum.createResource(resourceToCreate as DiagnosticReport | Procedure);

  return {
    success: true,
    action: 'create',
    resourceType,
    resource: result,
  };
}

async function readClinicalReport(
  resourceType: ClinicalReportResourceType,
  id: string
): Promise<ClinicalReportResult> {
  try {
    const resource = await medplum.readResource(resourceType as ResourceType, id);
    return {
      success: true,
      action: 'read',
      resourceType,
      resource: resource as DiagnosticReport | Procedure,
    };
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'outcome' in error &&
      (error as { outcome?: OperationOutcome }).outcome?.issue?.[0]?.code === 'not-found'
    ) {
      return {
        success: true,
        action: 'read',
        resourceType,
        resource: null,
      };
    }
    throw error;
  }
}

async function updateClinicalReport(
  resourceType: ClinicalReportResourceType,
  id: string,
  data?: Partial<DiagnosticReport> | Partial<Procedure>
): Promise<ClinicalReportResult> {
  if (!data) {
    return {
      success: false,
      action: 'update',
      resourceType,
      error: 'Data is required for update action',
    };
  }

  const existing = await medplum.readResource(resourceType as ResourceType, id);
  const updated = { ...existing, ...data, resourceType, id };
  const result = await medplum.updateResource(updated as DiagnosticReport | Procedure);

  return {
    success: true,
    action: 'update',
    resourceType,
    resource: result,
  };
}

async function deleteClinicalReport(
  resourceType: ClinicalReportResourceType,
  id: string
): Promise<ClinicalReportResult> {
  await medplum.deleteResource(resourceType as ResourceType, id);
  return {
    success: true,
    action: 'delete',
    resourceType,
  };
}

async function searchClinicalReports(
  resourceType: ClinicalReportResourceType,
  searchParams: Record<string, string | number | boolean | string[]>
): Promise<ClinicalReportResult> {
  const queryString = new URLSearchParams(
    Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(',') : String(value);
        return acc;
      },
      {} as Record<string, string>
    )
  ).toString();

  const bundle = (await medplum.search(resourceType as ResourceType, queryString)) as Bundle;
  const resources = (bundle.entry?.map((e) => e.resource) || []) as (DiagnosticReport | Procedure)[];

  return {
    success: true,
    action: 'search',
    resourceType,
    resources,
    total: bundle.total ?? resources.length,
  };
}
