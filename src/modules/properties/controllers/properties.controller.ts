import { AuthGuard } from '@/shared/guards/auth.guard';
import { OptionalAuthGuard } from '@/shared/guards/optional-auth.guard';
import { Body, Controller, Get, Param, Post, Req, UseGuards,UploadedFile,ParseFilePipe,UseInterceptors,Query } from '@nestjs/common';
import { Request } from 'express';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { RentalPreferencesDto } from '../dto/rental-preferences.dto';
// import { Body, Controller, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { CreatePropertyDto } from '../dto/create-property.dto';
import { PropertiesService } from '../services/properties.service';

@Controller({ path: 'properties', version: '2' })
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }
  @UseGuards(AuthGuard)
  @Post('rental-preferences')
  async saveOrClearRentalPreferences(
    @Req() req: Request,
    @Body() rentalPreferencesDto: RentalPreferencesDto & { clear?: boolean },
  ) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.propertiesService.saveOrClearRentalPreferences(
      tenant_id,
      rentalPreferencesDto,
    );
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  async getAllProperties(
    @Query() query: any,
    @Req() req: Request
  ) {
    let tenant_id: string | undefined = undefined;
    if ((req as any).user && ((req as any).user.sub || (req as any).user.id)) {
      tenant_id = (req as any).user.sub || (req as any).user.id;
    }
    const { bedrooms, bathrooms, parking, min_price, max_price, search,property_type } = query;
    const page_number = query.page_number ? parseInt(query.page_number as string, 10) : 1;
    const page_size = query.page_size ? parseInt(query.page_size as string, 10) : 10;
    return this.propertiesService.getAllPropertiesSummary(
      tenant_id,
      page_number,
      page_size,
      search,
      bedrooms,
      bathrooms,
      parking,
      min_price,
      max_price,
      property_type,
    );
  }

  @UseGuards(AuthGuard)
  @Get('rental-preferences')
  async getRentalPreferences(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.propertiesService.getRentalPreferences(tenant_id);
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
