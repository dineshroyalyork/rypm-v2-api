import { AuthGuard } from '@/shared/guards/auth.guard';
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
import { ZodValidationPipe } from 'nestjs-zod';
import { AddLikedDto, addLikedSchema } from '../dto/add-liked.dto';
import { LikedService } from '../service/liked.service';

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

  @Get('summary')
  async getAllLiked(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    const page_number = req.query.page_number ? parseInt(req.query.page_number as string, 10) : 1;
    const page_size = req.query.page_size ? parseInt(req.query.page_size as string, 10) : 10;
    return this.likedService.getAllLiked(tenant_id,page_number, page_size);
  }

  @Get()
  async getLikedSummary(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    const liked = await this.likedService.getLikedSummary(tenant_id);
    return liked;
  }
}
