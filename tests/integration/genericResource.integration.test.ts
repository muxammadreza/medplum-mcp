import { medplum } from '../../src/config/medplumClient';
import { GenericResourceTool } from '../../src/tools/genericResourceTool';

// Mock medplum client
jest.mock('../../src/config/medplumClient', () => ({
  medplum: {
    createResource: jest.fn(),
    readResource: jest.fn(),
    updateResource: jest.fn(),
    deleteResource: jest.fn(),
    searchResources: jest.fn(),
    patchResource: jest.fn(),
  },
  ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
}));

describe('Generic Resource Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Project resource', async () => {
    const resource = { name: 'My Project' };
    const mockCreated = { resourceType: 'Project', id: '123', name: 'My Project' };
    (medplum.createResource as jest.Mock).mockResolvedValue(mockCreated);

    const result = await GenericResourceTool.create('Project', resource);
    expect(result).toEqual(mockCreated);
    expect(medplum.createResource).toHaveBeenCalledWith({ resourceType: 'Project', ...resource });
  });

  it('should search for Bots', async () => {
    const searchParams = { name: 'Test Bot' };
    const mockResults = [{ resourceType: 'Bot', id: '1', name: 'Test Bot' }];
    (medplum.searchResources as jest.Mock).mockResolvedValue(mockResults);

    const result = await GenericResourceTool.search('Bot', searchParams);
    expect(result).toEqual(mockResults);
    expect(medplum.searchResources).toHaveBeenCalledWith('Bot', 'name=Test+Bot');
  });

  it('should delete a Subscription', async () => {
    (medplum.deleteResource as jest.Mock).mockResolvedValue(undefined);

    await GenericResourceTool.delete('Subscription', '123');
    expect(medplum.deleteResource).toHaveBeenCalledWith('Subscription', '123');
  });
});
