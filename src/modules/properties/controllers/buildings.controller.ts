// src/modules/properties/controllers/buildings.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { BuildingsService } from '../services/buildings.service';

@Controller({ path: 'buildings', version: '2' })
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  async create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create(createBuildingDto);
  }
}
