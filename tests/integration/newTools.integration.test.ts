import { medplum } from '../../src/config/medplumClient';
import { createBinary, getBinaryById, CreateBinaryArgs } from '../../src/tools/binaryUtils';
import { postBundle, PostBundleArgs } from '../../src/tools/transactionUtils';
import { Bundle } from '@medplum/fhirtypes';

// Mock medplum client
jest.mock('../../src/config/medplumClient', () => ({
  medplum: {
    createResource: jest.fn(),
    readResource: jest.fn(),
    executeBatch: jest.fn(),
  },
  ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
}));

describe('Integration Tests for Binary and Transaction Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Binary Tools', () => {
    it('should create a binary resource', async () => {
      const args: CreateBinaryArgs = {
        data: 'SGVsbG8gV29ybGQ=', // Base64 "Hello World"
        contentType: 'text/plain',
        filename: 'hello.txt',
      };

      const mockBinary = {
        resourceType: 'Binary',
        id: '123',
        contentType: 'text/plain',
        data: 'SGVsbG8gV29ybGQ=',
      };

      (medplum.createResource as jest.Mock).mockResolvedValue(mockBinary);

      const result = await createBinary(args);
      expect(result).toEqual(mockBinary);
      expect(medplum.createResource).toHaveBeenCalledWith({
        resourceType: 'Binary',
        contentType: 'text/plain',
        data: 'SGVsbG8gV29ybGQ=',
      });
    });

    it('should get a binary resource by ID', async () => {
      const mockBinary = {
        resourceType: 'Binary',
        id: '123',
      };
      (medplum.readResource as jest.Mock).mockResolvedValue(mockBinary);

      const result = await getBinaryById({ binaryId: '123' });
      expect(result).toEqual(mockBinary);
      expect(medplum.readResource).toHaveBeenCalledWith('Binary', '123');
    });
  });

  describe('Transaction Tools', () => {
    it('should execute a bundle', async () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [],
      };

      const mockResponseBundle = {
        resourceType: 'Bundle',
        type: 'transaction-response',
        entry: [],
      };

      (medplum.executeBatch as jest.Mock).mockResolvedValue(mockResponseBundle);

      const result = await postBundle({ bundle });
      expect(result).toEqual(mockResponseBundle);
      expect(medplum.executeBatch).toHaveBeenCalledWith(bundle);
    });
  });
});
