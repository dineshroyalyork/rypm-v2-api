import { AuthGuard } from '@/shared/guards/auth.guard';
import { OptionalAuthGuard } from '@/shared/guards/optional-auth.guard';
import { Body, Controller, Get, Param, Post, Req, UseGuards, UploadedFile, ParseFilePipe, UseInterceptors, Query, UsePipes, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { CreatePropertyDto, createPropertySchema } from '../dto/create-property.dto';
import { RentalPreferencesDto } from '../dto/rental-preferences.dto';
import { GetPropertiesSummaryDto, getPropertiesSummarySchema } from '../dto/get-properties-summary.dto';
import { SimilarPropertiesDto, similarPropertiesSchema } from '../dto/similar-properties.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from '../services/properties.service';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller({ path: 'properties', version: '2' })
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPropertySchema))
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }
  @UseGuards(AuthGuard)
  @Post('rental-preferences')
  async saveOrClearRentalPreferences(@Req() req: Request, @Body() rentalPreferencesDto: RentalPreferencesDto & { clear?: boolean }) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.propertiesService.saveOrClearRentalPreferences(tenant_id, rentalPreferencesDto);
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  async getAllProperties(@Query() query: any, @Req() req: Request) {
    try {
      // Validate query parameters using Zod schema
      const validatedQuery = getPropertiesSummarySchema.parse(query);
      
      // Extract tenant_id from authenticated user if available
      let tenant_id: string | undefined = undefined;
      if ((req as any).user && ((req as any).user.sub || (req as any).user.id)) {
        tenant_id = (req as any).user.sub || (req as any).user.id;
      }
      
      // Override tenant_id from query if user is authenticated
      if (tenant_id) {
        validatedQuery.tenant_id = tenant_id;
      }
      
      return this.propertiesService.getAllPropertiesSummary(validatedQuery);
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new BadRequestException('Invalid query parameters', error.errors);
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('rental-preferences')
  async getRentalPreferences(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.propertiesService.getRentalPreferences(tenant_id);
  }

  @UseGuards(OptionalAuthGuard)
  @Get('similar')
  @UsePipes(new ZodValidationPipe(similarPropertiesSchema))
  async getSimilarProperties(@Query() query: SimilarPropertiesDto) {
    return this.propertiesService.getSimilarProperties(query);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  async getPropertyById(@Param('id') property_id: string, @Req() req: Request) {
    let tenant_id: string | undefined = undefined;
    if ((req as any).user && ((req as any).user.sub || (req as any).user.id)) {
      tenant_id = (req as any).user.sub || (req as any).user.id;
    }
    return this.propertiesService.getPropertyById(property_id, tenant_id);
  }
  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [],
      })
    )
    file: Express.Multer.File
  ) {
    const csvData = file.buffer.toString('utf-8');
    return this.propertiesService.importFromCsv(csvData);
  }
}
