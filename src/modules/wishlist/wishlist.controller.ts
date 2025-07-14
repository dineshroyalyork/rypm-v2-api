import {
    Body,
    Controller,
    Get,
    Delete,
    Put,
    Param,
    Post,
    Req,
    UseGuards,
    UsePipes,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { AuthGuard } from '@/shared/guards/auth.guard';
  import { WishlistService } from './wishlist.service';
  
  import {
    CreateWishlistDto,
    createWishlistSchema,
  } from './dto/create-wishlist.dto';
  import {
    AddPropertyDto,
    addPropertySchema,
  } from './dto/add-property.dto';
  import {
    MovePropertyDto,
    movePropertySchema,
  } from './dto/move-property.dto';
  import { ZodValidationPipe } from 'nestjs-zod';
  
  @UseGuards(AuthGuard)
  @Controller('wishlists')
  export class WishlistController {
    constructor(private wishlistService: WishlistService) {}
  
    @Post()
    @UsePipes(new ZodValidationPipe(createWishlistSchema))
    create(@Req() req: Request, @Body() dto: CreateWishlistDto) {
      const tenantId = (req as any).user?.sub || (req as any).user?.id;
      return this.wishlistService.createWishlist(tenantId, dto);
    }
  
    @Get()
    findAll(@Req() req) {
      const tenantId = (req as any).user?.sub || (req as any).user?.id;
      return this.wishlistService.getTenantWishlists(tenantId);
    }
  
    @Post(':id/items')
    @UsePipes(new ZodValidationPipe(addPropertySchema))
    addProperty(
      @Param('id') wishlistId: string,
      @Body() dto: AddPropertyDto,
    ) {
      return this.wishlistService.addPropertyToWishlist(wishlistId, dto);
    }
  
    @Delete(':id/items/:propertyId')
    removeProperty(
      @Param('id') wishlistId: string,
      @Param('propertyId') propertyId: string,
    ) {
      return this.wishlistService.removePropertyFromWishlist(wishlistId, propertyId);
    }
  
    @Put(':id')
    rename(@Param('id') id: string, @Body('name') name: string) {
      return this.wishlistService.renameWishlist(id, name);
    }
  
    @Delete(':id')
    delete(@Param('id') id: string) {
      return this.wishlistService.deleteWishlist(id);
    }
  
    @Post('move')
    @UsePipes(new ZodValidationPipe(movePropertySchema))
    moveProperty(@Body() dto: MovePropertyDto) {
      return this.wishlistService.moveProperty(dto);
    }
  }
  