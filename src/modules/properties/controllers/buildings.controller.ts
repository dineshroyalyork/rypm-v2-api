// src/modules/properties/controllers/buildings.controller.ts
import { Body, Controller, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { BuildingsService } from '../services/buildings.service';

@Controller({ path: 'buildings', version: '2' })
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  async create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create(createBuildingDto);
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
    return this.buildingsService.importFromCsv(csvData);
  }
}
