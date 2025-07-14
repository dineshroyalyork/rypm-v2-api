import { Body, Controller, Post } from '@nestjs/common';
import { PropertiesService } from '../services/properties.service';
import { CreatePropertyDto, createPropertySchema } from '../dto/create-property.dto';


@Controller({ path: 'properties', version: '2' })
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@Body() body:CreatePropertyDto ) {
    return this.propertiesService.create(body);
  
  }
} 