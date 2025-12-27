import { medplum, ensureAuthenticated } from '../config/medplumClient';
import {
  Reference,
  ProjectMembership,
  OperationOutcome,
  Patient,
  Practitioner,
  RelatedPerson,
} from '@medplum/fhirtypes';

export async function whoAmI(): Promise<
  Patient | Practitioner | RelatedPerson | Reference<ProjectMembership> | OperationOutcome
> {
  // ensureAuthenticated() will try to login if not logged in.
  await ensureAuthenticated();
  const profile = medplum.getProfile();
  if (!profile) {
    throw new Error('Not authenticated or profile not found.');
  }
  return profile as any; // Medplum getProfile returns ProfileResource which is (Patient | Practitioner | RelatedPerson)
}

export async function logout(): Promise<{ success: true }> {
  await medplum.signOut();
  return { success: true };
}
