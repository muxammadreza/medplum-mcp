import { medplum } from '../../src/config/medplumClient';
import { listProjects, switchProject } from '../../src/tools/projectUtils';
import { getHealthCheck } from '../../src/tools/instanceUtils';
import { bulkImport } from '../../src/tools/bulkUtils';
import { sendEmail } from '../../src/tools/adminActionUtils';
import { fhircastSubscribe, fhircastUnsubscribe, fhircastGetContext } from '../../src/tools/fhircastUtils';

// Mock medplum client
jest.mock('../../src/config/medplumClient', () => ({
  medplum: {
    getLogins: jest.fn(),
    setActiveLogin: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    sendEmail: jest.fn(),
    fhircastSubscribe: jest.fn(),
    fhircastUnsubscribe: jest.fn(),
    fhircastGetContext: jest.fn(),
    fhirUrl: jest.fn().mockImplementation((path) => `https://api.medplum.com/fhir/R4/${path}`),
  },
  ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
}));

describe('Integration Tests for Newly Added Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Project Tools', () => {
    it('should list projects', async () => {
      const mockLogins = [
        {
          project: { reference: 'Project/123', display: 'Test Project' },
          profile: { reference: 'Practitioner/456', display: 'Test User' },
        },
      ];
      (medplum.getLogins as jest.Mock).mockReturnValue(mockLogins);

      const result = await listProjects();
      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('123');
      expect(medplum.getLogins).toHaveBeenCalled();
    });

    it('should switch project', async () => {
      const mockLogin = {
        project: { reference: 'Project/123', display: 'Test Project' },
      };
      (medplum.getLogins as jest.Mock).mockReturnValue([mockLogin]);
      (medplum.setActiveLogin as jest.Mock).mockResolvedValue(undefined);

      const result = await switchProject({ projectId: '123' });
      expect(result.success).toBe(true);
      expect(medplum.setActiveLogin).toHaveBeenCalledWith(mockLogin);
    });
  });

  describe('Instance Tools', () => {
    it('should get health check', async () => {
      const mockHealth = { ok: true };
      (medplum.get as jest.Mock).mockResolvedValue(mockHealth);

      const result = await getHealthCheck();
      expect(result).toEqual(mockHealth);
      expect(medplum.get).toHaveBeenCalledWith('healthcheck');
    });
  });

  describe('Bulk Import Tool', () => {
    it('should call $import', async () => {
        const mockResponse = { resourceType: 'OperationOutcome' };
        (medplum.post as jest.Mock).mockResolvedValue(mockResponse);

        const url = 'https://example.com/data.ndjson';
        await bulkImport({ url });

        expect(medplum.post).toHaveBeenCalledWith(
            expect.stringContaining('$import'),
            expect.objectContaining({
                resourceType: 'Parameters',
                parameter: expect.arrayContaining([
                    expect.objectContaining({ name: 'inputSource', valueUri: url })
                ])
            })
        );
    });
  });

  describe('Admin Action Tools', () => {
    it('should send email', async () => {
        const mockResponse = { resourceType: 'OperationOutcome' };
        (medplum.sendEmail as jest.Mock).mockResolvedValue(mockResponse);

        const args = { to: 'test@example.com', subject: 'Test' };
        await sendEmail(args);

        expect(medplum.sendEmail).toHaveBeenCalledWith(args);
    });
  });

  describe('FHIRcast Tools', () => {
    it('should subscribe to topic', async () => {
        const mockSub = { topic: 'topic', events: ['event'] };
        (medplum.fhircastSubscribe as jest.Mock).mockResolvedValue(mockSub);

        await fhircastSubscribe({ topic: 'topic', events: ['event'] });
        expect(medplum.fhircastSubscribe).toHaveBeenCalledWith('topic', ['event']);
    });

    it('should unsubscribe from topic', async () => {
        (medplum.fhircastUnsubscribe as jest.Mock).mockResolvedValue(undefined);
        const subReq = { topic: 'topic', events: ['event'], endpoint: 'url' } as any;

        await fhircastUnsubscribe({ subscriptionRequest: subReq });
        expect(medplum.fhircastUnsubscribe).toHaveBeenCalledWith(subReq);
    });

    it('should get context', async () => {
        const mockContext = { context: [] };
        (medplum.fhircastGetContext as jest.Mock).mockResolvedValue(mockContext);

        await fhircastGetContext({ topic: 'topic' });
        expect(medplum.fhircastGetContext).toHaveBeenCalledWith('topic');
    });
  });
});
