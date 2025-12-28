/**
 * Unified Patient Data Tool
 * Consolidates: readPatientEverything, readPatientSummary, ccdaExport
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Bundle } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type PatientDataAction = 'everything' | 'summary' | 'ccda';

export interface PatientDataArgs {
  action: PatientDataAction;
  patientId: string;
}

export interface PatientDataResult {
  success: boolean;
  action: PatientDataAction;
  patientId: string;
  data?: Bundle | string | unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function patientData(args: PatientDataArgs): Promise<PatientDataResult> {
  await ensureAuthenticated();

  const { action, patientId } = args;

  if (!patientId) {
    return { success: false, action, patientId: '', error: 'patientId is required' };
  }

  try {
    switch (action) {
      case 'everything':
        return await getPatientEverything(patientId);
      case 'summary':
        return await getPatientSummary(patientId);
      case 'ccda':
        return await getCcdaExport(patientId);
      default:
        return {
          success: false,
          action,
          patientId,
          error: `Unknown action: ${action}. Valid: everything, summary, ccda`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, action, patientId, error: errorMessage };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function getPatientEverything(patientId: string): Promise<PatientDataResult> {
  const result = await medplum.readPatientEverything(patientId);
  return { success: true, action: 'everything', patientId, data: result };
}

async function getPatientSummary(patientId: string): Promise<PatientDataResult> {
  // Patient summary - get key resources
  const patient = await medplum.readResource('Patient', patientId);
  const conditions = await medplum.searchResources('Condition', `patient=Patient/${patientId}`);
  const medications = await medplum.searchResources('MedicationRequest', `patient=Patient/${patientId}`);
  const observations = await medplum.searchResources('Observation', `patient=Patient/${patientId}&_count=10&_sort=-date`);
  
  return {
    success: true,
    action: 'summary',
    patientId,
    data: {
      patient,
      conditions,
      medications,
      recentObservations: observations,
    },
  };
}

async function getCcdaExport(patientId: string): Promise<PatientDataResult> {
  // Use the $docref operation for C-CDA export
  const result = await medplum.get(
    medplum.fhirUrl('Patient', patientId, '$docref')
  );
  return { success: true, action: 'ccda', patientId, data: result };
}
