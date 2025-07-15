import { Body, Controller, Delete, Get, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { LikedService } from '../service/liked.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const addLikedSchema = z.object({ property_id: z.string().uuid('Invalid property_id') });
type AddLikedDto = z.infer<typeof addLikedSchema>;

@UseGuards(AuthGuard)
@Controller({ path: 'liked', version: '2' })
export class LikedController {
  constructor(private likedService: LikedService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(addLikedSchema))
  async addLiked(@Req() req: Request, @Body() dto: AddLikedDto) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.likedService.addLiked(tenant_id, dto.property_id);
  }

  @Delete()
  @UsePipes(new ZodValidationPipe(addLikedSchema))
  async removeLiked(@Req() req: Request, @Body() dto: AddLikedDto) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.likedService.removeLiked(tenant_id, dto.property_id);
  }

  @Get()
  async getAllLiked(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.likedService.getAllLiked(tenant_id);
  }
} 