import { AuthGuard } from '@/shared/guards/auth.guard';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
}
