import { medplum } from '../../src/config/medplumClient';
import { addProjectSecret, AddProjectSecretArgs } from '../../src/tools/adminUtils';
import { GenericResourceTool } from '../../src/tools/genericResourceTool';

// Mock medplum client
jest.mock('../../src/config/medplumClient', () => ({
  medplum: {
    readResource: jest.fn(),
    updateResource: jest.fn(),
    patchResource: jest.fn(),
  },
  ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
}));

describe('Admin Tools Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProjectSecret', () => {
    it('should add a new secret to a project', async () => {
      const projectId = 'proj-123';
      const existingProject = {
        resourceType: 'Project',
        id: projectId,
        name: 'Test Project',
        secret: [],
      };

      (medplum.readResource as jest.Mock).mockResolvedValue(existingProject);
      (medplum.updateResource as jest.Mock).mockImplementation((r) => Promise.resolve(r));

      const args: AddProjectSecretArgs = {
        projectId,
        name: 'MY_SECRET',
        value: 'secret-value',
      };

      const result = await addProjectSecret(args);

      expect(medplum.readResource).toHaveBeenCalledWith('Project', projectId);
      expect(medplum.updateResource).toHaveBeenCalledWith({
        ...existingProject,
        secret: [{ name: 'MY_SECRET', valueString: 'secret-value' }],
      });
      // @ts-ignore
      expect(result.secret[0]).toEqual({ name: 'MY_SECRET', valueString: 'secret-value' });
    });

    it('should update an existing secret', async () => {
      const projectId = 'proj-123';
      const existingProject = {
        resourceType: 'Project',
        id: projectId,
        name: 'Test Project',
        secret: [{ name: 'MY_SECRET', valueString: 'old-value' }],
      };

      (medplum.readResource as jest.Mock).mockResolvedValue(existingProject);
      (medplum.updateResource as jest.Mock).mockImplementation((r) => Promise.resolve(r));

      const args: AddProjectSecretArgs = {
        projectId,
        name: 'MY_SECRET',
        value: 'new-value',
      };

      await addProjectSecret(args);

      expect(medplum.updateResource).toHaveBeenCalledWith({
        ...existingProject,
        secret: [{ name: 'MY_SECRET', valueString: 'new-value' }],
      });
    });
  });

  describe('GenericResourceTool.patch', () => {
    it('should patch a resource', async () => {
      const resourceType = 'Patient';
      const id = 'pat-123';
      const patch = { op: 'replace', path: '/gender', value: 'male' };

      (medplum.patchResource as jest.Mock).mockResolvedValue({ resourceType, id, gender: 'male' });

      const result = await GenericResourceTool.patch(resourceType, id, patch);

      expect(medplum.patchResource).toHaveBeenCalledWith(resourceType, id, patch);
      expect(result).toEqual({ resourceType, id, gender: 'male' });
    });
  });
});
