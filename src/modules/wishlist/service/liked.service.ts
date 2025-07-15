import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

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
        success: true,
        message: 'Property added to liked list',
        data: liked,
      };
    }

    return {
      success: true,
      message: 'Property already exists in liked list',
      data: liked,
    };
  }

  async removeLiked(tenant_id: string, property_id: string) {
    const liked = await this.prisma.liked.findUnique({ where: { tenant_id } });
    if (!liked) {
      return {
        success: true,
        message: 'No liked list found for tenant. Nothing to remove.',
      };
    }

    const updatedPropertyIds = liked.property_ids.filter(id => id !== property_id);

    await this.prisma.liked.update({
      where: { tenant_id },
      data: { property_ids: updatedPropertyIds },
    });

    return {
      success: true,
      message: 'Property removed from liked list',
    };
  }

  async getAllLiked(tenant_id: string) {
    const liked = await this.prisma.liked.findUnique({
      where: { tenant_id },
      select: { id: true, property_ids: true },
    });

    if (!liked) {
      return {
        success: true,
        message: 'No liked list found for tenant',
        data: { count: 0, property_ids: [] },
      };
    }

    return {
      success: true,
      message: 'Liked properties retrieved successfully',
      data: {
        id: liked.id,
        count: liked.property_ids.length,
        // property_ids: liked.property_ids,
      },
    };
  }
}
