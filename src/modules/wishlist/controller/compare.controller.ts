import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { CompareService } from '../service/compare.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { compareSchema, CompareDto } from '../dto/compare.dto';

@UseGuards(AuthGuard)
@Controller({ path: 'compare', version: '2' })
export class CompareController {
  constructor(private compareService: CompareService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(compareSchema))
  async compare(@Body() compareDto: CompareDto) {
    return this.compareService.getPropertiesForCompare(compareDto.property_ids);
  }
}