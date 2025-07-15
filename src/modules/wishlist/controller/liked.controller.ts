import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { LikedService } from '../service/liked.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { addLikedSchema, AddLikedDto } from '../dto/add-liked.dto';

@UseGuards(AuthGuard)
@Controller({ path: 'liked', version: '2' })
export class LikedController {
  constructor(private likedService: LikedService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(addLikedSchema))
  async addLiked(
    @Req() req: Request,
    @Body() addLikedDto: AddLikedDto,
  ) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.likedService.addLiked(tenant_id, addLikedDto.property_id);
  }

  @Delete()
  @UsePipes(new ZodValidationPipe(addLikedSchema))
  async removeLiked(
    @Req() req: Request,
    @Body() addLikedDto: AddLikedDto,
  ) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.likedService.removeLiked(tenant_id, addLikedDto.property_id);
  }

  @Get()
  async getAllLiked(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.likedService.getAllLiked(tenant_id);
  }
}
