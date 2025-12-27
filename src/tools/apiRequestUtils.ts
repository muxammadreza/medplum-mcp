import { ensureAuthenticated, medplum } from '../config/medplumClient';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface MedplumApiRequestArgs {
  /**
   * HTTP method to use for the Medplum request.
   */
  method: HttpMethod;
  /**
   * Relative Medplum path (e.g., "fhir/R4/Patient" or "admin/projects").
   * Leading slashes are optional.
   */
  path: string;
  /**
   * Optional query parameters to append. Array values will be repeated.
   */
  queryParams?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  /**
   * Optional body for write operations.
   */
  body?: any;
}

function buildQueryString(queryParams?: MedplumApiRequestArgs['queryParams']): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Executes a raw Medplum API request, covering any endpoint (FHIR, admin, auth, Binary, etc.).
 */
export async function callMedplumApi(args: MedplumApiRequestArgs): Promise<unknown> {
  await ensureAuthenticated();

  const normalizedPath = args.path.startsWith('/') ? args.path.slice(1) : args.path;
  const url = `${normalizedPath}${buildQueryString(args.queryParams)}`;

  switch (args.method) {
    case 'GET':
      return medplum.get(url);
    case 'POST':
      return medplum.post(url, args.body);
    case 'PUT':
      return medplum.put(url, args.body);
    case 'PATCH':
      return medplum.patch(url, args.body);
    case 'DELETE':
      return medplum.delete(url);
    default:
      throw new Error(`Unsupported method: ${args.method}`);
  }
}
