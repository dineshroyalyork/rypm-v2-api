import {
  Injectable,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateWishlistDto } from '../dto/create-wishlist.dto';
import { AddPropertyDto } from '../dto/add-property.dto';
import { MovePropertyDto } from '../dto/move-property.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async createWishlist(tenant_id: string, dto: CreateWishlistDto) {
    const existing = await this.prisma.wishlist.findFirst({
      where: {
        tenant_id,
        name: dto.name,
      },
    });
    if (existing) {
      throw new HttpException('You cannot create with the same name', 500);
    }
    return this.prisma.wishlist.create({
      data: {
        name: dto.name,
        tenant_id,
      },
    });
  }

  async getTenantWishlists(tenant_id: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { tenant_id },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });
    return wishlists.map((w) => ({
      id: w.id,
      name: w.name,
      count: w._count.properties,
    }));
  }

  async addPropertyToWishlist(wishlist_id: string, dto: AddPropertyDto) {
    for (const property_id of dto.property_ids) {
      await this.prisma.wishlist_property.upsert({
        where: {
          wishlist_id_property_id: {
            wishlist_id,
            property_id,
          },
        },
        update: {},
        create: {
          wishlist_id,
          property_id,
        },
      });
    }
    return { success: true };
  }

  async removePropertyFromWishlist(wishlist_id: string, property_id: string) {
    await this.prisma.wishlist_property.delete({
      where: {
        wishlist_id_property_id: {
          wishlist_id,
          property_id,
        },
      },
    });
    return { success: true };
  }

  async removePropertiesFromWishlist(wishlist_id: string, property_ids: string[]) {
    const wishlist = await this.prisma.wishlist.findUnique({ where: { id: wishlist_id } });
    if (!wishlist) throw new Error('Wishlist not found');
    await this.prisma.wishlist_property.deleteMany({
      where: {
        wishlist_id,
        property_id: { in: property_ids },
      },
    });
    return { success: true };
  }

  async renameWishlist(wishlist_id: string, newName: string) {
    return this.prisma.wishlist.update({
      where: { id: wishlist_id },
      data: { name: newName },
    });
  }

  async deleteWishlist(wishlist_id: string) {
    await this.prisma.wishlist_property.deleteMany({
      where: { wishlist_id },
    });
    return this.prisma.wishlist.delete({
      where: { id: wishlist_id },
    });
  }

  async moveProperty(dto: MovePropertyDto) {
    for (const property_id of dto.property_ids) {
      await this.prisma.wishlist_property.delete({
        where: {
          wishlist_id_property_id: {
            wishlist_id: dto.from_wishlist_id,
            property_id,
          },
        },
      });

      await this.prisma.wishlist_property.upsert({
        where: {
          wishlist_id_property_id: {
            wishlist_id: dto.to_wishlist_id,
            property_id,
          },
        },
        update: {},
        create: {
          wishlist_id: dto.to_wishlist_id,
          property_id,
        },
      });
    }
    return { success: true };
  }

  async getWishlistById(wishlist_id: string) {
    return this.prisma.wishlist.findUnique({
      where: { id: wishlist_id },
      select: {
        id: true,
        name: true,
        tenant_id: true,
        properties: true,
        created_at: true,
        updated_at: true,
        // add other fields as needed
      },
    });
  }
}
