import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class CompareService {
  constructor(private prisma: PrismaService) {}

  async getPropertiesForCompare(property_ids: string[]) {
    return this.prisma.property.findMany({
      where: { id: { in: property_ids } },
    });
  }
} 