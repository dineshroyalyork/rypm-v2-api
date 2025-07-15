import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { WishlistService } from '../service/wishlist.service';

import {
  CreateWishlistDto,
  createWishlistSchema,
} from '../dto/create-wishlist.dto';
import {
  AddPropertyDto,
  addPropertySchema,
} from '../dto/add-property.dto';
import {
  MovePropertyDto,
  movePropertySchema,
} from '../dto/move-property.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@UseGuards(AuthGuard)
@Controller({ path: 'wishlist', version: '2' })
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createWishlistSchema))
  create(
    @Req() req: Request,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.wishlistService.createWishlist(tenant_id, createWishlistDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    return this.wishlistService.getTenantWishlists(tenant_id);
  }

  @Get(':id')
  async getWishlistById(@Param('id') wishlist_id: string) {
    return this.wishlistService.getWishlistById(wishlist_id);
  }

  @Post(':id/items')
  // @UsePipes(new ZodValidationPipe(addPropertySchema))
  addProperty(
    @Param('id') wishlist_id: string,
    @Body() addPropertyDto: AddPropertyDto,
  ) {
    return this.wishlistService.addPropertyToWishlist(wishlist_id, addPropertyDto);
  }

  @Delete(':id/items')
  removeProperties(
    @Param('id') wishlist_id: string,
    @Body('property_ids') property_ids: string[],
  ) {
    return this.wishlistService.removePropertiesFromWishlist(wishlist_id, property_ids);
  }

  @Delete()
  deleteMultipleWishlists(@Body('wishlist_ids') wishlist_ids: string[]) {
    return this.wishlistService.deleteMultipleWishlists(wishlist_ids);
  }

  @Post('move')
  @UsePipes(new ZodValidationPipe(movePropertySchema))
  moveProperty(@Body() movePropertyDto: MovePropertyDto) {
    return this.wishlistService.moveProperty(movePropertyDto);
  }
}
