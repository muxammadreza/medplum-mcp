jest.mock('../src/config/medplumClient', () => {
  const get = jest.fn().mockResolvedValue({ method: 'GET' });
  const post = jest.fn().mockResolvedValue({ method: 'POST' });
  const put = jest.fn().mockResolvedValue({ method: 'PUT' });
  const patch = jest.fn().mockResolvedValue({ method: 'PATCH' });
  const del = jest.fn().mockResolvedValue({ method: 'DELETE' });

  return {
    ensureAuthenticated: jest.fn().mockResolvedValue(undefined),
    medplum: {
      get,
      post,
      put,
      patch,
      delete: del,
    },
  };
});

import { callMedplumApi } from '../src/tools/apiRequestUtils';
import { ensureAuthenticated, medplum } from '../src/config/medplumClient';

describe('callMedplumApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds query parameters for GET requests', async () => {
    await callMedplumApi({
      method: 'GET',
      path: '/fhir/R4/Patient',
      queryParams: {
        _count: 10,
        status: ['active', 'draft'],
      },
    });

    expect(ensureAuthenticated).toHaveBeenCalled();
    expect(medplum.get).toHaveBeenCalledWith('fhir/R4/Patient?_count=10&status=active&status=draft');
  });

  it('passes body for write operations', async () => {
    const body = { name: 'Test Project' };
    await callMedplumApi({
      method: 'POST',
      path: 'admin/projects',
      body,
    });

    expect(medplum.post).toHaveBeenCalledWith('admin/projects', body);
  });
});
