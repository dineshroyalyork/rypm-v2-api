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
      where: { tenant_id, name: dto.name },
    });
    if (existing) {
      throw new HttpException('You cannot create a wishlist with the same name', 400);
    }
    const wishlist = await this.prisma.wishlist.create({
      data: { name: dto.name, tenant_id },
    });
    return {
      success: true,
      message: 'Wishlist created successfully',
      data: wishlist,
    };
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

    return {
      success: true,
      message: 'Wishlist list fetched successfully',
      data: wishlists.map((w) => ({
        id: w.id,
        name: w.name,
        count: w._count.properties,
      })),
    };
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
    return {
      success: true,
      message: 'Properties added to wishlist successfully',
    };
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
    return {
      success: true,
      message: 'Property removed from wishlist successfully',
    };
  }

  async removePropertiesFromWishlist(wishlist_id: string, property_ids: string[]) {
    const wishlist = await this.prisma.wishlist.findUnique({ where: { id: wishlist_id } });
    if (!wishlist) throw new HttpException('Wishlist not found', 404);

    await this.prisma.wishlist_property.deleteMany({
      where: {
        wishlist_id,
        property_id: { in: property_ids },
      },
    });

    return {
      success: true,
      message: 'Selected properties removed from wishlist successfully',
    };
  }

  async renameWishlist(wishlist_id: string, newName: string) {
    const wishlist = await this.prisma.wishlist.update({
      where: { id: wishlist_id },
      data: { name: newName },
    });

    return {
      success: true,
      message: 'Wishlist renamed successfully',
      data: wishlist,
    };
  }

  async deleteMultipleWishlists(wishlist_ids: string[]) {
    if (!Array.isArray(wishlist_ids) || wishlist_ids.length === 0) {
      return {
        success: false,
        message: 'No wishlist IDs provided',
      };
    }
  
    await this.prisma.wishlist_property.deleteMany({
      where: {
        wishlist_id: { in: wishlist_ids },
      },
    });
  
    await this.prisma.wishlist.deleteMany({
      where: {
        id: { in: wishlist_ids },
      },
    });
  
    return {
      success: true,
      message: 'Wishlists deleted successfully',
      deleted_count: wishlist_ids.length,
    };
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

    return {
      success: true,
      message: 'Properties moved to new wishlist successfully',
    };
  }

  async getWishlistById(wishlist_id: string, page_number = 1, page_size = 10) {
    // Calculate skip and take for pagination
    const skip = (page_number - 1) * page_size;
    const take = page_size;

    // Get total count of properties in the wishlist
    const totalCount = await this.prisma.wishlist_property.count({
      where: { wishlist_id },
    });

    // Fetch wishlist and paginated properties
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlist_id },
      select: {
        id: true,
        name: true,
        tenant_id: true,
        created_at: true,
        updated_at: true,
        properties: {
          skip,
          take,
          select: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Flatten property info for easier consumption
    const properties = wishlist?.properties?.map((wp) => wp.property) || [];

    return {
      success: true,
      message: 'Wishlist details fetched successfully',
      data: {
        ...wishlist,
        properties,
        total_count: totalCount,
        page_number,
        page_size,
      },
    };
  }
}
