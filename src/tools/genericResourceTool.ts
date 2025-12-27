import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Resource, ResourceType, OperationOutcome } from '@medplum/fhirtypes';

export class GenericResourceTool {
  static async create(resourceType: string, resource: any): Promise<Resource | OperationOutcome> {
    await ensureAuthenticated();
    // Ensure resourceType is set in the resource
    const resourceToCreate = { ...resource, resourceType };
    return medplum.createResource(resourceToCreate);
  }

  static async getById(resourceType: string, id: string): Promise<Resource | null> {
    await ensureAuthenticated();
    try {
      return await medplum.readResource(resourceType as ResourceType, id);
    } catch (error: any) {
      if (error.outcome?.issue?.[0]?.code === 'not-found') {
        return null;
      }
      throw error;
    }
  }

  static async update(resourceType: string, id: string, updates: any): Promise<Resource> {
    await ensureAuthenticated();
    const existing = await medplum.readResource(resourceType as ResourceType, id);
    const updated = { ...existing, ...updates, resourceType, id };
    return medplum.updateResource(updated);
  }

  static async delete(resourceType: string, id: string): Promise<void> {
    await ensureAuthenticated();
    await medplum.deleteResource(resourceType as ResourceType, id);
  }

  static async search(resourceType: string, searchParams: any): Promise<Resource[]> {
    await ensureAuthenticated();
    const queryString = new URLSearchParams(searchParams).toString();
    return medplum.searchResources(resourceType as ResourceType, queryString);
  }

  static async patch(resourceType: string, id: string, patch: any): Promise<Resource> {
    await ensureAuthenticated();
    return medplum.patchResource(resourceType as ResourceType, id, patch);
  }
}
