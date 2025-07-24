import { Controller, Post, Get, Delete, Param, Query, Body, UseInterceptors, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe } from 'nestjs-zod';
import { PropertyAttachmentsService } from '../services/property-attachments.service';
import {
  CreatePropertyAttachmentDto,
  GetPropertyAttachmentsDto,
  createPropertyAttachmentSchema,
  getPropertyAttachmentsSchema,
} from '../dto/property-attachments.dto';
@Controller('property-attachments')
export class PropertyAttachmentsController {
  constructor(private readonly propertyAttachmentsService: PropertyAttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndCreateAttachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [],
      })
    )
    file: Express.Multer.File,
    @Body(new ZodValidationPipe(createPropertyAttachmentSchema))
    createDto: CreatePropertyAttachmentDto
  ) {
    return this.propertyAttachmentsService.uploadAndCreateAttachment(file, createDto);
  }

  @Get()
  async getPropertyAttachments(
    @Query(new ZodValidationPipe(getPropertyAttachmentsSchema))
    query: GetPropertyAttachmentsDto
  ) {
    return this.propertyAttachmentsService.getPropertyAttachments(query);
  }

  @Get(':id')
  async getAttachmentById(@Param('id') id: string) {
    return this.propertyAttachmentsService.getAttachmentById(id);
  }
}
