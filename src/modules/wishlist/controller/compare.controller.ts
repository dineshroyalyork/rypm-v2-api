import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { CompareService } from '../service/compare.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const compareSchema = z.object({
  property_ids: z.array(z.string().uuid('Invalid property_id')),
});
type CompareDto = z.infer<typeof compareSchema>;

@UseGuards(AuthGuard)
@Controller({ path: 'compare', version: '2' })
export class CompareController {
  constructor(private compareService: CompareService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(compareSchema))
  async compare(@Body() dto: CompareDto) {
    return this.compareService.getPropertiesForCompare(dto.property_ids);
  }
} 