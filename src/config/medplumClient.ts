/**
 * Medplum Client Configuration
 * 
 * This module initializes the Medplum SDK client for FHIR operations.
 * It uses environment variables for configuration.
 */

import { MedplumClient as MedplumClientSDK } from '@medplum/core';
import fetch from 'node-fetch';

// Environment variables should already be loaded by index.ts
// Do NOT call dotenv.config() here to avoid duplicate loading
const { MEDPLUM_BASE_URL, MEDPLUM_CLIENT_ID, MEDPLUM_CLIENT_SECRET } = process.env;

// Validate required environment variables (log to stderr only)
if (!MEDPLUM_CLIENT_ID || !MEDPLUM_CLIENT_SECRET) {
  console.error('[Medplum] Warning: Missing MEDPLUM_CLIENT_ID or MEDPLUM_CLIENT_SECRET');
}

// Create the Medplum client
export const medplum = new MedplumClientSDK({
  baseUrl: MEDPLUM_BASE_URL || 'https://api.medplum.com/',
  fetch: fetch as unknown as typeof globalThis.fetch,
  clientId: MEDPLUM_CLIENT_ID,
  clientSecret: MEDPLUM_CLIENT_SECRET,
});

// Export type alias
export type MedplumClient = MedplumClientSDK;

/**
 * Ensures that the Medplum client is authenticated.
 * Uses client credentials grant for server-to-server auth.
 */
export async function ensureAuthenticated(): Promise<void> {
  if (!medplum.getActiveLogin()) {
    if (!MEDPLUM_CLIENT_ID || !MEDPLUM_CLIENT_SECRET) {
      throw new Error('Medplum credentials not configured. Set MEDPLUM_CLIENT_ID and MEDPLUM_CLIENT_SECRET.');
    }
    
    try {
      await medplum.startClientLogin(MEDPLUM_CLIENT_ID, MEDPLUM_CLIENT_SECRET);
      console.error('[Medplum] Authenticated successfully');
    } catch (error) {
      console.error('[Medplum] Authentication failed:', error);
      throw new Error('Medplum authentication failed. Check your credentials.');
    }
  }
}
