import { Body, Controller, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { PropertiesService } from '../services/properties.service';

@Controller({ path: 'properties', version: '2' })
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
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
