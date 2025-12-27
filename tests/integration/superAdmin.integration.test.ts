import { medplum } from '../../src/config/medplumClient';
import {
  reindexResources,
  rebuildCompartments,
  purgeResources,
  forceSetPassword,
  ReindexResourcesArgs,
  RebuildCompartmentsArgs,
  PurgeResourcesArgs,
  ForceSetPasswordArgs,
} from '../../src/tools/superAdminUtils';

// Mock medplum client
jest.mock('../../src/config/medplumClient', () => ({
  medplum: {
    post: jest.fn(),
  },
  ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
}));

describe('Super Admin Tools Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reindexResources', () => {
    it('should call reindex endpoint with correct args', async () => {
      (medplum.post as jest.Mock).mockResolvedValue({ resourceType: 'OperationOutcome' });
      const args: ReindexResourcesArgs = { resourceTypes: ['Patient'] };
      await reindexResources(args);
      expect(medplum.post).toHaveBeenCalledWith('admin/super/reindex', args);
    });
  });

  describe('rebuildCompartments', () => {
    it('should call rebuild-compartments endpoint', async () => {
      (medplum.post as jest.Mock).mockResolvedValue({ resourceType: 'OperationOutcome' });
      const args: RebuildCompartmentsArgs = { resourceType: 'Patient', id: '123' };
      await rebuildCompartments(args);
      expect(medplum.post).toHaveBeenCalledWith('admin/super/rebuild-compartments', args);
    });
  });

  describe('purgeResources', () => {
    it('should call purge endpoint', async () => {
      (medplum.post as jest.Mock).mockResolvedValue({ resourceType: 'OperationOutcome' });
      const args: PurgeResourcesArgs = { resourceType: 'AuditEvent', before: '2020-01-01' };
      await purgeResources(args);
      expect(medplum.post).toHaveBeenCalledWith('admin/super/purge', args);
    });
  });

  describe('forceSetPassword', () => {
    it('should call setpassword endpoint', async () => {
      (medplum.post as jest.Mock).mockResolvedValue({ resourceType: 'OperationOutcome' });
      const args: ForceSetPasswordArgs = { userId: 'user-123', password: 'new-password' };
      await forceSetPassword(args);
      expect(medplum.post).toHaveBeenCalledWith('admin/super/setpassword', {
        user: { reference: 'User/user-123' },
        password: 'new-password',
      });
    });
  });
});
