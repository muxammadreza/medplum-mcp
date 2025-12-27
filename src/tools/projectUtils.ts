import { medplum } from '../config/medplumClient';

export async function listProjects(): Promise<any> {
  const logins = medplum.getLogins();
  return logins.map((login) => ({
    projectId: login.project.reference?.split('/')[1],
    projectName: login.project.display,
    profileId: login.profile.reference?.split('/')[1],
    profileName: login.profile.display,
  }));
}

export async function switchProject(args: { projectId: string; login?: string }): Promise<any> {
  const logins = medplum.getLogins();
  // Find login by projectId
  const login = logins.find((l) => l.project.reference?.endsWith(`/${args.projectId}`));

  if (!login) {
    throw new Error(`No login found for project ID: ${args.projectId}`);
  }

  await medplum.setActiveLogin(login);
  return { success: true, message: `Switched to project ${login.project.display} (${args.projectId})` };
}
