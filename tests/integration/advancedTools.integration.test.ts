import { medplum } from '../../src/config/medplumClient';
import { executeBot, graphql, pushToAgent } from '../../src/tools/advancedUtils';
import {
  bulkExport,
  readPatientEverything,
  readPatientSummary,
  readResourceGraph,
  requestSchema,
} from '../../src/tools/dataUtils';
import { readHistory, readVersion } from '../../src/tools/versionUtils';
import {
  upsertResource,
  createComment,
  startNewProject,
  startNewUser,
  startNewPatient,
} from '../../src/tools/miscUtils';

// Mock medplum client
jest.mock('../../src/config/medplumClient', () => ({
  medplum: {
    executeBot: jest.fn(),
    graphql: jest.fn(),
    pushToAgent: jest.fn(),
    bulkExport: jest.fn(),
    readPatientEverything: jest.fn(),
    readPatientSummary: jest.fn(),
    readResourceGraph: jest.fn(),
    requestSchema: jest.fn(),
    readHistory: jest.fn(),
    readVersion: jest.fn(),
    upsertResource: jest.fn(),
    createComment: jest.fn(),
    startNewProject: jest.fn(),
    startNewUser: jest.fn(),
    startNewPatient: jest.fn(),
    getProject: jest.fn(),
    getProfile: jest.fn(),
  },
  ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
}));

describe('Integration Tests for Advanced Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Advanced Utils', () => {
    it('should execute bot', async () => {
      (medplum.executeBot as jest.Mock).mockResolvedValue({ success: true });
      await executeBot({ botId: '123', data: { foo: 'bar' } });
      expect(medplum.executeBot).toHaveBeenCalledWith('123', { foo: 'bar' }, 'application/json');
    });

    it('should execute graphql', async () => {
      (medplum.graphql as jest.Mock).mockResolvedValue({ data: {} });
      await graphql({ query: '{ Patient { id } }' });
      expect(medplum.graphql).toHaveBeenCalledWith('{ Patient { id } }', undefined, undefined);
    });
  });

  describe('Data Utils', () => {
    it('should start bulk export', async () => {
      (medplum.bulkExport as jest.Mock).mockResolvedValue({ id: 'job1' });
      await bulkExport({ resourceTypes: ['Patient'] });
      expect(medplum.bulkExport).toHaveBeenCalledWith(['Patient'], undefined, undefined);
    });

    it('should read patient everything', async () => {
      (medplum.readPatientEverything as jest.Mock).mockResolvedValue({ resourceType: 'Bundle' });
      await readPatientEverything({ patientId: '123' });
      expect(medplum.readPatientEverything).toHaveBeenCalledWith('123');
    });
  });

  describe('Misc Utils', () => {
    it('should upsert resource', async () => {
      const res = { resourceType: 'Patient', id: '123' };
      (medplum.upsertResource as jest.Mock).mockResolvedValue(res);
      await upsertResource({ resource: res as any });
      expect(medplum.upsertResource).toHaveBeenCalledWith(res, undefined);
    });

    it('should create comment', async () => {
      (medplum.createComment as jest.Mock).mockResolvedValue({});
      await createComment({ resourceType: 'Patient', id: '123', text: 'note' });
      expect(medplum.createComment).toHaveBeenCalledWith({ reference: 'Patient/123' }, 'note');
    });
  });
});
