import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromBase64 } from '@aws-sdk/util-base64';
import { Logger } from '@nestjs/common';
import { format } from 'date-fns';

const logger = new Logger('AwsUtility');

// Load env variables
const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || ''; // New centralized CloudFront URL

if (!BUCKET_NAME || !CLOUDFRONT_URL) {
  logger.error('Missing AWS S3 configuration. Check environment variables.');
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Upload a base64 file to S3 with organized folder structure
 */
export async function uploadFile(
  file: string,
  category: 'properties' | 'tenants' | 'leases' | 'mobile-app',
  subCategory?: string,
  itemId?: string
): Promise<{ url: string; type: string }> {
  try {
    const type = await base64FileHeaderMapper(file);
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const body = fromBase64(base64Data);

    const fileName = `${Date.now()}.${type}`;

    let basePath = '';
    switch (category) {
      case 'properties':
        basePath = itemId ? `properties/property_${itemId}/${subCategory || 'images'}/` : 'properties/';
        break;
      case 'tenants':
        basePath = itemId ? `tenants/tenant_${itemId}/${subCategory || 'id_proofs'}/` : 'tenants/';
        break;
      case 'leases':
        basePath = itemId ? `leases/lease_${itemId}/${subCategory || 'signed'}/` : 'leases/';
        break;
      case 'mobile-app':
      default:
        basePath = 'mobile-app/';
        break;
    }

    const key = `${basePath}${fileName}`;
    const url = `${CLOUDFRONT_URL}/${key}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: `image/${type}`,
      })
    );

    return { url, type };
  } catch (error) {
    logger.error('Error uploading file to S3:', error);
    throw new Error(`Error uploading image to S3: ${error.message}`);
  }
}

/**
 * Upload multiple files to S3
 */
export async function uploadMultipleFiles(
  files: Array<{
    key: string;
    content: Buffer;
    contentType: string;
  }>
): Promise<string[]> {
  try {
    const basePath = 'crm-uploads/';
    const uploadPromises = files.map(async file => {
      const date = format(new Date(), 'yyyy-MM-dd-HH:mm');
      const fileName = `${basePath}crm_${date}_${file.key}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: file.content,
          ContentType: file.contentType,
        })
      );

      const url = `${CLOUDFRONT_URL}/${fileName}`;
      return url;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Failed to upload one or more files:', error);
    throw error;
  }
}

/**
 * Upload a file from Multer to S3 with organized folder structure
 */
export async function uploadFileToS3(
  file: Express.Multer.File,
  category: string,
  subCategory?: string,
  itemId?: string
): Promise<{ url: string; imageId: string }> {
  try {
    const fileName = `${Date.now()}_${file.originalname}`;

    let basePath = '';
    switch (category) {
      case 'properties':
        basePath = itemId ? `properties/property_${itemId}/${subCategory || 'images'}/` : 'properties/';
        break;
      case 'tenants':
        basePath = itemId ? `tenants/tenant_${itemId}/${subCategory || 'id_proofs'}/` : 'tenants/';
        break;
      case 'leases':
        basePath = itemId ? `leases/lease_${itemId}/${subCategory || 'signed'}/` : 'leases/';
        break;
      case 'mobile-app':
      default:
        basePath = 'mobile-app/';
        break;
    }

    const key = `${basePath}${fileName}`;
    const url = `${CLOUDFRONT_URL}/${key}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return { url, imageId: key };
  } catch (error) {
    logger.error('Error uploading file to S3:', error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Helper function to get subcategory based on file type and context
 */
export function getSubCategory(fileType: string, context?: string): string {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const documentTypes = ['pdf', 'doc', 'docx'];

  if (imageTypes.includes(fileType.toLowerCase())) {
    return context === 'property' ? 'images' : 'photos';
  } else if (documentTypes.includes(fileType.toLowerCase())) {
    return context === 'lease' ? 'signed' : 'agreements';
  } else if (fileType.toLowerCase() === 'mp4' || fileType.toLowerCase() === 'mov') {
    return 'videos';
  }

  return 'documents';
}

/**
 * Determine file type from base64 data
 */
export async function base64FileHeaderMapper(fileBase64: string): Promise<string> {
  if (fileBase64.startsWith('data:')) {
    const matches = fileBase64.match(/^data:([a-zA-Z0-9]+)\/([a-zA-Z0-9]+);base64,/);
    if (matches) {
      const fileType = matches[2].toLowerCase();
      const extensionMap: Record<string, string> = {
        mpeg: 'mp3',
        mp3: 'mp3',
        wav: 'wav',
        'x-wav': 'wav',
        ogg: 'ogg',
        jpeg: 'jpg',
        jpg: 'jpg',
        png: 'png',
        pdf: 'pdf',
      };
      return extensionMap[fileType] || 'unknown';
    }
  }

  if (fileBase64.startsWith('/9j')) return 'jpg';
  if (fileBase64.startsWith('iVBOR')) return 'png';
  if (fileBase64.startsWith('JVBER')) return 'pdf';
  if (fileBase64.startsWith('SUQz') || fileBase64.startsWith('ID3')) return 'mp3';
  if (fileBase64.startsWith('UklGR')) return 'wav';
  if (fileBase64.startsWith('T2dnU')) return 'ogg';

  return 'unknown';
}
