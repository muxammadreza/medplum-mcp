import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { OperationOutcome, ProjectMembership, Reference, AccessPolicy, Project } from '@medplum/fhirtypes';

export interface InviteUserArgs {
  projectId: string;
  email: string;
  resourceType?: 'Patient' | 'Practitioner' | 'RelatedPerson';
  accessPolicy?: Reference<AccessPolicy>;
  firstName?: string;
  lastName?: string;
  sendEmail?: boolean;
  admin?: boolean;
}

export async function inviteUser(args: InviteUserArgs): Promise<ProjectMembership | OperationOutcome> {
  await ensureAuthenticated();

  const body: any = {
    resourceType: args.resourceType || 'Practitioner',
    email: args.email,
    accessPolicy: args.accessPolicy,
    firstName: args.firstName || '',
    lastName: args.lastName || '',
    sendEmail: args.sendEmail !== false, // Default to true
  };

  if (args.admin) {
    body.membership = { admin: true };
  }

  return medplum.invite(args.projectId, body);
}

export interface AddProjectSecretArgs {
  projectId: string;
  name: string;
  value: string;
}

export async function addProjectSecret(args: AddProjectSecretArgs): Promise<Project | OperationOutcome> {
  await ensureAuthenticated();

  // We need to fetch the project first, then add the secret, then update.
  // Or patch it.
  // Patching array is tricky with JSON Patch (need index or append).
  // Safest is read-modify-write.

  const project = await medplum.readResource('Project', args.projectId);

  // Check if secret exists and update, or push new
  const secrets = project.secret || [];
  const existingIndex = secrets.findIndex((s: any) => s.name === args.name);

  if (existingIndex >= 0) {
    secrets[existingIndex].valueString = args.value;
  } else {
    secrets.push({ name: args.name, valueString: args.value });
  }

  return medplum.updateResource({ ...project, secret: secrets });
}
