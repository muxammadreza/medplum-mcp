/**
 * Unified Project Management Tool
 * Consolidates: listProjects, switchProject, getProject, getProfile, inviteUser, addProjectSecret
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Project, ProjectMembership, Reference, AccessPolicy } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type ProjectAction = 'list' | 'switch' | 'get' | 'get-profile' | 'invite' | 'add-secret';

export interface ManageProjectArgs {
  action: ProjectAction;
  projectId?: string;
  // Invite user params
  email?: string;
  resourceType?: 'Patient' | 'Practitioner' | 'RelatedPerson';
  accessPolicy?: Reference<AccessPolicy>;
  firstName?: string;
  lastName?: string;
  sendEmail?: boolean;
  admin?: boolean;
  // Secret params
  secretName?: string;
  secretValue?: string;
}

export interface ProjectResult {
  success: boolean;
  action: ProjectAction;
  data?: unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function manageProject(args: ManageProjectArgs): Promise<ProjectResult> {
  await ensureAuthenticated();

  const { action } = args;

  try {
    switch (action) {
      case 'list':
        return await listProjects();
      case 'switch':
        if (!args.projectId) {
          return { success: false, action, error: 'projectId is required for switch action' };
        }
        return await switchProject(args.projectId);
      case 'get':
        return await getProject();
      case 'get-profile':
        return await getProfile();
      case 'invite':
        return await inviteUser(args);
      case 'add-secret':
        return await addSecret(args);
      default:
        return {
          success: false,
          action,
          error: `Unknown action: ${action}. Valid: list, switch, get, get-profile, invite, add-secret`,
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

async function listProjects(): Promise<ProjectResult> {
  const memberships = await medplum.searchResources('ProjectMembership', '_count=100');
  return { success: true, action: 'list', data: memberships };
}

async function switchProject(projectId: string): Promise<ProjectResult> {
  await medplum.setActiveLogin({
    ...medplum.getActiveLogin()!,
    project: { reference: `Project/${projectId}` },
  });
  return { success: true, action: 'switch', data: { projectId } };
}

async function getProject(): Promise<ProjectResult> {
  const project = await medplum.getProject();
  return { success: true, action: 'get', data: project };
}

async function getProfile(): Promise<ProjectResult> {
  const profile = medplum.getProfile();
  return { success: true, action: 'get-profile', data: profile };
}

async function inviteUser(args: ManageProjectArgs): Promise<ProjectResult> {
  if (!args.projectId || !args.email) {
    return { success: false, action: 'invite', error: 'projectId and email are required' };
  }

  const result = await medplum.invite(args.projectId, {
    resourceType: args.resourceType || 'Practitioner',
    firstName: args.firstName || '',
    lastName: args.lastName || '',
    email: args.email,
    sendEmail: args.sendEmail ?? true,
    admin: args.admin ?? false,
  });

  return { success: true, action: 'invite', data: result };
}

async function addSecret(args: ManageProjectArgs): Promise<ProjectResult> {
  if (!args.projectId || !args.secretName || !args.secretValue) {
    return { success: false, action: 'add-secret', error: 'projectId, secretName, and secretValue are required' };
  }

  const project = await medplum.readResource('Project', args.projectId);
  const secrets = project.secret || [];
  
  // Update or add secret
  const existingIndex = secrets.findIndex((s) => s.name === args.secretName);
  if (existingIndex >= 0) {
    secrets[existingIndex] = { name: args.secretName, valueString: args.secretValue };
  } else {
    secrets.push({ name: args.secretName, valueString: args.secretValue });
  }

  const updated = await medplum.updateResource({ ...project, secret: secrets });
  return { success: true, action: 'add-secret', data: updated };
}
