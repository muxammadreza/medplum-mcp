/**
 * Unified Initialization Tool
 * Consolidates: startNewProject, startNewUser, startNewPatient
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Patient, Practitioner } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type StartNewType = 'project' | 'user' | 'patient';

export interface StartNewArgs {
  type: StartNewType;
  // Project params
  login?: string;
  projectName?: string;
  // User params
  user?: Record<string, unknown>;
  // Patient params
  patient?: Partial<Patient>;
}

export interface StartNewResult {
  success: boolean;
  type: StartNewType;
  data?: unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function startNew(args: StartNewArgs): Promise<StartNewResult> {
  await ensureAuthenticated();

  const { type } = args;

  try {
    switch (type) {
      case 'project':
        return await startNewProject(args);
      case 'user':
        return await startNewUser(args);
      case 'patient':
        return await startNewPatient(args);
      default:
        return {
          success: false,
          type,
          error: `Unknown type: ${type}. Valid: project, user, patient`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, type, error: errorMessage };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function startNewProject(args: StartNewArgs): Promise<StartNewResult> {
  if (!args.login || !args.projectName) {
    return { success: false, type: 'project', error: 'login and projectName are required' };
  }

  const result = await medplum.startNewProject({
    login: args.login,
    projectName: args.projectName,
  });

  return { success: true, type: 'project', data: result };
}

async function startNewUser(args: StartNewArgs): Promise<StartNewResult> {
  if (!args.user) {
    return { success: false, type: 'user', error: 'user object is required' };
  }

  const result = await medplum.startNewUser(args.user as any);
  return { success: true, type: 'user', data: result };
}

async function startNewPatient(args: StartNewArgs): Promise<StartNewResult> {
  if (!args.patient) {
    return { success: false, type: 'patient', error: 'patient object is required' };
  }

  const result = await medplum.startNewPatient(args.patient as any);
  return { success: true, type: 'patient', data: result };
}
