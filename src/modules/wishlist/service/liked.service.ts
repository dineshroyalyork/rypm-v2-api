import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class LikedService {
  constructor(private prisma: PrismaService) {}

  async addLiked(tenant_id: string, property_id: string) {
    let liked = await this.prisma.liked.findUnique({ where: { tenant_id } });
    if (!liked) {
      liked = await this.prisma.liked.create({ data: { tenant_id, property_ids: [property_id] } });
    } else if (!liked.property_ids.includes(property_id)) {
      await this.prisma.liked.update({
        where: { tenant_id },
        data: { property_ids: [...liked.property_ids, property_id] },
      });
    }
    return { success: true };
  }

  async removeLiked(tenant_id: string, property_id: string) {
    const liked = await this.prisma.liked.findUnique({ where: { tenant_id } });
    if (!liked) return { success: true };
    const updated = liked.property_ids.filter(id => id !== property_id);
    await this.prisma.liked.update({
      where: { tenant_id },
      data: { property_ids: updated },
    });
    return { success: true };
  }

  async getAllLiked(tenant_id: string) {
    const liked = await this.prisma.liked.findUnique({ where: { tenant_id }, select: { id: true, property_ids: true } });
    return liked ? { id: liked.id, count: liked.property_ids.length } : null;
  }
} 