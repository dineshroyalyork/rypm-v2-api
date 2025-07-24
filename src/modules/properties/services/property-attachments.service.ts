import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreatePropertyAttachmentDto, GetPropertyAttachmentsDto } from '../dto/property-attachments.dto';
import { uploadFileToS3 } from '@/shared/utils/aws';
import { AttachmentType } from '@/shared/enums';

@Injectable()
export class PropertyAttachmentsService {
  private readonly logger = new Logger(PropertyAttachmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upload file and create property attachment
   */
  async uploadAndCreateAttachment(file: Express.Multer.File, createDto: CreatePropertyAttachmentDto) {
    try {
      // Verify property exists
      const property = await this.prisma.properties.findUnique({
        where: { id: createDto.property_id },
      });

      if (!property) {
        throw new NotFoundException(`Property with ID ${createDto.property_id} not found`);
      }

      // Determine file type based on file extension
      const fileType = await this.getFileType(file);

      // Upload file to S3 with organized structure
      const uploadResult = await uploadFileToS3(file, 'properties', createDto.category, createDto.property_id);
      const url = uploadResult.url; // ✅ Only the string URL

      // Create attachment record
      const attachment = await this.prisma.propertyAttachments.create({
        data: {
          property_id: createDto.property_id,
          label: createDto.label,
          type: fileType,
          url,
          file_name: file.originalname,
        },
      });

      return attachment;
    } catch (error) {
      this.logger.error(`Error uploading and creating property attachment: ${error.message}`);
      throw error;
    }
  }

  async getPropertyAttachments(query: GetPropertyAttachmentsDto) {
    try {
      const where: any = {
        property_id: query.property_id,
      };

      const attachments = await this.prisma.propertyAttachments.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });

      return attachments;
    } catch (error) {
      this.logger.error(`Error getting property attachments: ${error.message}`);
      throw error;
    }
  }

  async getAttachmentById(id: string) {
    try {
      const attachment = await this.prisma.propertyAttachments.findUnique({
        where: { id },
      });

      if (!attachment) {
        throw new NotFoundException(`Property attachment with ID ${id} not found`);
      }

      return attachment;
    } catch (error) {
      this.logger.error(`Error getting property attachment by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to determine file type from Multer file
   */
  private async getFileType(file: Express.Multer.File): Promise<AttachmentType> {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv'];

    if (imageTypes.includes(file.mimetype)) {
      return AttachmentType.IMAGE;
    } else if (videoTypes.includes(file.mimetype)) {
      return AttachmentType.VIDEO;
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
  }
}
