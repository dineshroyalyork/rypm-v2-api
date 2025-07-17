import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompareService {
  constructor(private prisma: PrismaService) {}

  async getPropertiesForCompare(property_ids: string[]) {
    const properties = await this.prisma.property.findMany({
      where: { id: { in: property_ids } },
    });
    return {
      statusCode: 200,
      success: true,
      message: 'Properties for compare fetched successfully',
      data: properties,
    };
  }
} 