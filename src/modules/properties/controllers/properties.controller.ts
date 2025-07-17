import { AuthGuard } from '@/shared/guards/auth.guard';
import { OptionalAuthGuard } from '@/shared/guards/optional-auth.guard';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { RentalPreferencesDto } from '../dto/rental-preferences.dto';
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
  async getAllProperties(@Req() req: Request) {
    let tenant_id: string | undefined = undefined;
    if ((req as any).user && ((req as any).user.sub || (req as any).user.id)) {
      tenant_id = (req as any).user.sub || (req as any).user.id;
    }
    const page_number = req.query.page_number ? parseInt(req.query.page_number as string, 10) : 1;
    const page_size = req.query.page_size ? parseInt(req.query.page_size as string, 10) : 10;
    const search = req.query.search ? String(req.query.search) : undefined;
    return this.propertiesService.getAllPropertiesSummary(tenant_id, page_number, page_size, search);
  }

  @UseGuards(AuthGuard)
  @Get('rental-preferences')
  async getRentalPreferences(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.propertiesService.getRentalPreferences(tenant_id);
  }
}
