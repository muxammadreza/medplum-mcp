/**
 * Unified Media Management Tool
 * Consolidates: createMedia, createAttachment, uploadMedia
 */

import { medplum, ensureAuthenticated } from '../config/medplumClient';
import { Attachment, Media } from '@medplum/fhirtypes';

// ============================================================================
// TYPES
// ============================================================================

export type MediaAction = 'create-media' | 'create-attachment' | 'upload';

export interface ManageMediaArgs {
  action: MediaAction;
  content?: Record<string, unknown>;
  data?: string | Record<string, unknown>;
  contentType: string;
  filename?: string;
}

export interface MediaResult {
  success: boolean;
  action: MediaAction;
  data?: Media | Attachment | unknown;
  error?: string;
}

// ============================================================================
// MAIN CONSOLIDATED TOOL
// ============================================================================

export async function manageMedia(args: ManageMediaArgs): Promise<MediaResult> {
  await ensureAuthenticated();

  const { action, content, data, contentType, filename } = args;

  try {
    switch (action) {
      case 'create-media':
        return await createMedia(content, contentType, filename);
      case 'create-attachment':
        return await createAttachment(data, contentType, filename);
      case 'upload':
        return await uploadMedia(data, contentType, filename);
      default:
        return {
          success: false,
          action,
          error: `Unknown action: ${action}. Valid: create-media, create-attachment, upload`,
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, action, error: errorMessage };
  }
}

// ============================================================================
// INTERNAL OPERATIONS
// ============================================================================

async function createMedia(
  content?: Record<string, unknown>,
  contentType?: string,
  filename?: string
): Promise<MediaResult> {
  if (!content || !contentType) {
    return { success: false, action: 'create-media', error: 'content and contentType are required' };
  }

  const media: Media = {
    resourceType: 'Media',
    status: 'completed',
    content: content as Attachment,
  };

  const result = await medplum.createResource(media);
  return { success: true, action: 'create-media', data: result };
}

async function createAttachment(
  data?: string | Record<string, unknown>,
  contentType?: string,
  filename?: string
): Promise<MediaResult> {
  if (!data || !contentType) {
    return { success: false, action: 'create-attachment', error: 'data and contentType are required' };
  }

  const attachment: Attachment = {
    contentType,
    title: filename,
    data: typeof data === 'string' ? data : JSON.stringify(data),
  };

  return { success: true, action: 'create-attachment', data: attachment };
}

async function uploadMedia(
  data?: string | Record<string, unknown>,
  contentType?: string,
  filename?: string
): Promise<MediaResult> {
  if (!data || !contentType) {
    return { success: false, action: 'upload', error: 'data and contentType are required' };
  }

  // Create a Binary resource with the data
  const binary = await medplum.createResource({
    resourceType: 'Binary',
    contentType,
    data: typeof data === 'string' ? data : JSON.stringify(data),
  });

  return { success: true, action: 'upload', data: binary };
}
