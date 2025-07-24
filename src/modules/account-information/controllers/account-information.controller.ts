import { Controller, Post, Get, Body, UseGuards, Request, UsePipes, Query,UseInterceptors,UploadedFiles } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AccountInformationService } from '../services/account-information.service';
import { accountInformationSchema, AccountInformationDto } from '../dto/account-information.dto';
import { InformationType } from '@/shared/enums/account-details.enum';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { uploadFileToS3 } from '@/shared/utils/aws';

@Controller({ path: 'account-information', version: '2' })
@UseGuards(AuthGuard)
export class AccountInformationController {
  constructor(private readonly accountInformationService: AccountInformationService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(accountInformationSchema))
  async createOrUpdateAccountInformation(@Request() req: any, @Body() accountInformationDto: AccountInformationDto) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    const result = await this.accountInformationService.createOrUpdateAccountInformation(tenant_id, accountInformationDto);
    return result;
  }

  @Get()
  async getAccountInformation(@Request() req: any, @Query('type') type?: InformationType) {
    try {
      const tenant_id = (req as any).user?.sub || (req as any).user?.id;
      const result = await this.accountInformationService.getAccountInformation(tenant_id, type);

      return {
        success: true,
        message: type ? `${type.replace('_', ' ')} retrieved successfully` : 'All account information retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Post('documents')
  @UseGuards(AuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async createOrUpdateDocuments(
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any
  ) {
    const tenant_id = req.user?.sub || req.user?.id;

    // files is now an array, each file has a .fieldname property
    const flatFiles: Record<string, Express.Multer.File> = {};
    for (const file of files) {
      flatFiles[file.fieldname] = file;
    }

    return this.accountInformationService.createOrUpdateDocuments(
      tenant_id,
      flatFiles
    );
  }

  @Post('introductory-video')
  @UseGuards(AuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadIntroductoryVideo(
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any
  ) {
    const tenant_id = req.user?.sub || req.user?.id;
    const videoFile = files.find(f => f.mimetype.startsWith('video/'));
    if (!videoFile) {
      throw new Error('No video file uploaded');
    }
    return this.accountInformationService.createOrUpdateIntroductoryVideo(
      tenant_id,
      videoFile
    );
  }
  
}
