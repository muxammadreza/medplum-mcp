import { medplum } from '../config/medplumClient';

export async function getHealthCheck(): Promise<any> {
  return medplum.get('healthcheck');
}
