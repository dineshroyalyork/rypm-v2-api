import { PrismaService } from '@/shared/prisma/prisma.service';
import { paginateArray } from '@/shared/utils/response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikedService {
  constructor(private prisma: PrismaService) {}

  async addLiked(tenant_id: string, property_id: string) {
    let liked = await this.prisma.liked.findUnique({ where: { tenant_id } });

    if (!liked) {
      liked = await this.prisma.liked.create({
        data: { tenant_id, property_ids: [property_id] },
      });
      return {
        statusCode: 201,
        success: true,
        message: 'Liked list created and property added',
        data: liked,
      };
    }

    if (!liked.property_ids.includes(property_id)) {
      liked = await this.prisma.liked.update({
        where: { tenant_id },
        data: { property_ids: [...liked.property_ids, property_id] },
      });
      return {
        statusCode: 200,
        success: true,
        message: 'Property added to liked list',
        data: liked,
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Property already exists in liked list',
      data: liked,
    };
  }

  async removeLiked(tenant_id: string, property_id: string) {
    const liked = await this.prisma.liked.findUnique({ where: { tenant_id } });
    if (!liked) {
      return {
        statusCode: 200,
        success: true,
        message: 'No liked list found for tenant. Nothing to remove.',
      };
    }

    const updatedPropertyIds = liked.property_ids.filter(
      (id) => id !== property_id,
    );

    await this.prisma.liked.update({
      where: { tenant_id },
      data: { property_ids: updatedPropertyIds },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Property removed from liked list',
    };
  }

  async getAllLiked(tenant_id: string, page_number = 1, page_size = 10) {
    const liked = await this.prisma.liked.findUnique({
      where: { tenant_id },
      select: { id: true, property_ids: true },
    });

    if (!liked) {
      return {
        statusCode: 200,
        success: true,
        message: 'No liked list found for tenant',
        data: { count: 0, property_ids: [] },
      };
    }

    // Fetch property details for all liked IDs
    const allProperties = await this.prisma.property.findMany({
      where: { id: { in: liked.property_ids } },
      select: {
        id: true,
        name: true,
        bedrooms: true,
        bathrooms: true,
        property_details: {
          select: {
            marketed_price: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    // Use the common pagination utility
    const paginated = paginateArray(allProperties, page_number, page_size);

    return {
      statusCode: 200,
      success: true,
      message: 'Liked properties retrieved successfully',
      data: {
        id: liked.id,
        properties: paginated.data,
        total_count: paginated.total_count,
        page_number: paginated.page_number,
        page_size: paginated.page_size,
      },
    };
  }

  async getLikedSummary(tenant_id: string) {
    const liked = await this.prisma.liked.findUnique({
      where: { tenant_id },
      select: { id: true, property_ids: true },
    });

    if (!liked) {
      return {
        statusCode: 200,
        success: true,
        message: 'No liked list found for tenant',
        data: { id: null, count: 0 },
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Liked details retrieved successfully',
      data: {
        id: liked.id,
        count: liked.property_ids.length,
      },
    };
  }
}
