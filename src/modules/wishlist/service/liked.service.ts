import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable, HttpException } from '@nestjs/common';

@Injectable()
export class LikedService {
  constructor(private prisma: PrismaService) {}

  async addLiked(tenant_id: string, property_id: string) {
    try {
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
    } catch (error) {
      throw new HttpException('Failed to add property to liked list', 500);
    }
  }

  async removeLiked(tenant_id: string, property_id: string) {
    try {
      const liked = await this.prisma.liked.findUnique({ where: { tenant_id } });
      if (!liked) {
        return {
          statusCode: 200,
          success: true,
          message: 'No liked list found for tenant. Nothing to remove .',
        };
      }

      const updatedPropertyIds = liked.property_ids.filter(id => id !== property_id);

      await this.prisma.liked.update({
        where: { tenant_id },
        data: { property_ids: updatedPropertyIds },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Property removed from liked list',
      };
    } catch (error) {
      throw new HttpException('Failed to remove property from liked list', 500);
    }
  }

  async getAllLiked(tenant_id: string, page_number = 1, page_size = 10) {
    try {
      const liked = await this.prisma.liked.findUnique({
        where: { tenant_id },
        select: { id: true, property_ids: true },
      });
    
      if (!liked || !liked.property_ids || liked.property_ids.length === 0) {
        return {
          statusCode: 200,
          success: true,
          message: 'No liked list found for tenant',
          data: { count: 0, property_ids: [] },
        };
      }
    
      const total_count = liked.property_ids.length;
      const skip = (page_number - 1) * page_size;
      const paginatedPropertyIds = liked.property_ids.slice(skip, skip + page_size);
    
      const properties = await this.prisma.properties.findMany({
        where: { id: { in: paginatedPropertyIds } },
        select: {
          id: true,
          name: true,
          bedrooms: true,
          bathrooms: true,
          latitude: true,
          longitude: true,
          marketed_price: true,
          thumbnail_image: true,
        },
      });
    
      return {
        statusCode: 200,
        success: true,
        message: 'Liked properties retrieved successfully',
        data: {
          id: liked.id,
          properties,
          total_count,
          page_number,
          page_size,
        },
      };
    } catch (error) {
      throw new HttpException('Failed to retrieve liked properties', 500);
    }
  }
  
}
