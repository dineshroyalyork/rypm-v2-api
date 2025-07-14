import {
    Injectable,
  } from '@nestjs/common';
  import { PrismaService } from '@/shared/prisma/prisma.service';
  import { CreateWishlistDto } from './dto/create-wishlist.dto';
  import { AddPropertyDto } from './dto/add-property.dto';
  import { MovePropertyDto } from './dto/move-property.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async createWishlist(tenantId: string, dto: CreateWishlistDto) {
    return this.prisma.wishlist.create({
      data: {
        name: dto.name,
        tenantId,
      },
    });
  }

  async getTenantWishlists(tenantId: string) {
    return this.prisma.wishlist.findMany({
      where: { tenantId },
      include: {
        items: {
          include: {
            property: true,
          },
        },
      },
    });
  }

  async addPropertyToWishlist(wishlistId: string, dto: AddPropertyDto) {
    return this.prisma.wishlistItem.create({
      data: {
        wishlistId,
        propertyId: dto.propertyId,
      },
    });
  }

  async removePropertyFromWishlist(wishlistId: string, propertyId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId,
        propertyId,
      },
    });
  }

  async renameWishlist(wishlistId: string, newName: string) {
    return this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: { name: newName },
    });
  }

  async deleteWishlist(wishlistId: string) {
    return this.prisma.wishlist.delete({
      where: { id: wishlistId },
    });
  }

  async moveProperty(dto: MovePropertyDto) {
    // Remove from old
    await this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: dto.fromWishlistId,
        propertyId: dto.propertyId,
      },
    });

    // Add to new
    return this.prisma.wishlistItem.create({
      data: {
        wishlistId: dto.toWishlistId,
        propertyId: dto.propertyId,
      },
    });
  }
}
