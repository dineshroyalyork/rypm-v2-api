import { PrismaService } from '@/shared/prisma/prisma.service';
import { HttpException, Injectable } from '@nestjs/common';
import { AddPropertyDto } from '../dto/add-property.dto';
import { CreateWishlistDto } from '../dto/create-wishlist.dto';
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
      statusCode: 200,
      success: true,
      message: 'Wishlist created successfully',
      data: wishlist,
    };
  }

  async getTenantWishlists(tenant_id: string) {
    const liked = await this.prisma.liked.findUnique({
      where: { tenant_id },
      select: {
        id: true,
        tenant_id: true,
        property_ids: true,
      },
    });

    let likedProperties: string[] = [];
    if (liked && liked.property_ids.length > 0) {
      // Fetch the latest 4 properties by id, sorted by created_at descending
      const properties = await this.prisma.properties.findMany({
        where: { id: { in: liked.property_ids } },
        orderBy: { created_at: 'desc' },
        select: { thumbnail_image: true, id: true, created_at: true },
      });

      // Sort the properties in the order of most recent (if not already sorted)
      // Take the first 4 and map to their names
      likedProperties = properties
        .slice(0, 4)
        .map(p => p.thumbnail_image)
        .filter((thumbnail_image): thumbnail_image is string => !!thumbnail_image);
    }

    const wishlists = await this.prisma.wishlist.findMany({
      where: { tenant_id },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    const wishlistsWithProperties = await Promise.all(
      wishlists.map(async w => {
        // Get the property IDs for this wishlist (from the join table)
        const wishlistProperties = await this.prisma.wishlist_property.findMany({
          where: { wishlist_id: w.id },
          orderBy: { created_at: 'desc' },
          select: { property_id: true },
          take: 4,
        });

        const propertyIds = wishlistProperties.map(wp => wp.property_id);

        // Fetch property names
        let properties: string[] = [];
        if (propertyIds.length > 0) {
          const props = await this.prisma.properties.findMany({
            where: { id: { in: propertyIds } },
            select: { thumbnail_image: true },
          });
          properties = props.map(p => p.thumbnail_image).filter((thumbnail_image): thumbnail_image is string => !!thumbnail_image);
        }

        return {
          id: w.id,
          name: w.name,
          count: w._count.properties,
          properties,
        };
      })
    );

    const result: Array<{ id: string; name: string; count: number; properties?: string[] }> = [];
    result.push({
      id: liked ? liked.id : '',
      name: 'Liked',
      count: liked ? liked.property_ids.length : 0,
      properties: likedProperties,
    });

    result.push(...wishlistsWithProperties);

    return {
      statusCode: 200,
      success: true,
      message: 'Wishlist list fetched successfully',
      data: result,
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
      statusCode: 200,
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
      statusCode: 200,
      success: true,
      message: 'Property removed from wishlist successfully',
    };
  }

  async removePropertiesFromWishlist(wishlist_id: string, property_ids: string[]) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlist_id },
    });
    if (!wishlist) throw new HttpException('Wishlist not found', 404);

    await this.prisma.wishlist_property.deleteMany({
      where: {
        wishlist_id,
        property_id: { in: property_ids },
      },
    });

    return {
      statusCode: 200,
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
      statusCode: 200,
      success: true,
      message: 'Wishlist renamed successfully',
      data: wishlist,
    };
  }

  async deleteMultipleWishlists(wishlist_ids: string[]) {
    if (!Array.isArray(wishlist_ids) || wishlist_ids.length === 0) {
      return {
        statusCode: 200,
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
      statusCode: 200,
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
      statusCode: 200,
      success: true,
      message: 'Properties moved to new wishlist successfully',
    };
  }

  async getWishlistById(wishlist_id: string, page_number = 1, page_size = 10) {
    // Validate wishlist existence
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlist_id },
      select: {
        id: true,
        name: true,
        tenant_id: true,
        created_at: true,
        updated_at: true,
      },
    });
  
    if (!wishlist) throw new HttpException('Wishlist not found', 404);
  
    const skip = (page_number - 1) * page_size;
    const take = page_size;
  
    // Fetch total count of properties in wishlist
    const total_count = await this.prisma.wishlist_property.count({
      where: { wishlist_id },
    });
  
    // Fetch paginated properties from the wishlist
    const wishlistProperties = await this.prisma.wishlist_property.findMany({
      where: { wishlist_id },
      skip,
      take,
      select: {
        properties: {
          select: {
            id: true,
            name: true,
            bathrooms: true,
            bedrooms: true,
            latitude: true,
            longitude: true,
            marketed_price: true,
          },
        },
      },
    });
  
    const properties = wishlistProperties.map(wp => wp.properties);
  
    return {
      statusCode: 200,
      success: true,
      message: 'Wishlist details fetched successfully',
      data: {
        ...wishlist,
        properties,
        total_count,
        page_number,
        page_size,
      },
    };
  }
  
}
