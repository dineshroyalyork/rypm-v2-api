import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateTourSlotsDto } from '../dto/create-tour-slots.dto';
import { GetTourSlotsDto } from '../dto/get-tour-slots.dto';

@Injectable()
export class TourSchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async createTourSlots(createTourSlotsDto: CreateTourSlotsDto) {
    const { property_id, tour_date, slot_duration_hours } = createTourSlotsDto;

    const baseDate = new Date(tour_date);
    const slots: any[] = [];

    // Create slots for the specified number of hours on the given date
    for (let i = 0; i < slot_duration_hours; i++) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(9 + i, 0, 0, 0); // Start from 9 AM, each slot is 1 hour

      slots.push({
        property_id,
        tour_date: slotDate,
        is_booked: false,
        is_completed: false,
      });
    }

    return await (this.prisma as any).tour_slots.createMany({
      data: slots,
    });
  }

  async getTourSlots(query: GetTourSlotsDto) {
    const { property_id, tour_date, start_date, end_date } = query;

    const where: any = {};

    if (property_id) {
      where.property_id = property_id;
    }

    if (tour_date) {
      const date = new Date(tour_date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.tour_date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (start_date && end_date) {
      where.tour_date = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    }

    return await this.prisma.tour_slots.findMany({
      where,
      orderBy: {
        tour_date: 'asc',
      },
    });
  }

  async getAvailableSlots(property_id: string, tour_date: string) {
    const date = new Date(tour_date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.prisma.tour_slots.findMany({
      where: {
        property_id,
        tour_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        is_booked: false,
      },
      orderBy: {
        tour_date: 'asc',
      },
    });
  }
}
