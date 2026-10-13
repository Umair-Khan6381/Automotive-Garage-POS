import { put } from '@vercel/blob';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Megabytes

export interface UploadResult {
  url: string;
  pathname?: string;
  contentType: string;
  size: number;
  storageProvider: 'vercel_blob' | 'secure_payload';
}

export const storageService = {
  /**
   * Validates and persistently stores uploaded receipts, salary payment proofs, and job photos.
   * If BLOB_READ_WRITE_TOKEN is configured in Vercel, saves to persistent Vercel Blob storage.
   * Otherwise, safely encapsulates as private secure data URL without local lambda disk dependency.
   */
  async uploadFile(options: {
    buffer?: Buffer;
    dataUrl?: string;
    filename: string;
    mimeType: string;
    folder?: string;
  }): Promise<UploadResult> {
    const { filename, mimeType, folder = 'garage-documents' } = options;

    // 1. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(`Unsupported file type: ${mimeType}. Only JPG, PNG, WEBP, and PDF documents are allowed.`);
    }

    let fileBuffer: Buffer;
    if (options.buffer) {
      fileBuffer = options.buffer;
    } else if (options.dataUrl) {
      const base64Data = options.dataUrl.replace(/^data:[^;]+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      throw new Error('No file payload provided for upload.');
    }

    // 2. Validate File Size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed 10MB limit.`);
    }

    // Clean filename
    const sanitizedFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const pathname = `${folder}/${sanitizedFilename}`;

    // 3. Persistent Vercel Blob Storage if configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(pathname, fileBuffer, {
        access: 'public',
        contentType: mimeType,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: mimeType,
        size: fileBuffer.length,
        storageProvider: 'vercel_blob'
      };
    }

    // 4. Secure DB/DataURL fallback (never saves to ephemeral lambda disk)
    const secureDataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    return {
      url: secureDataUrl,
      pathname,
      contentType: mimeType,
      size: fileBuffer.length,
      storageProvider: 'secure_payload'
    };
  }
};
