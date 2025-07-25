import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateTourSlotsDto } from '../dto/create-tour-slots.dto';
import { GetTourSlotsDto } from '../dto/get-tour-slots.dto';

@Injectable()
export class TourSchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async createTourSlots(createTourSlotsDto: CreateTourSlotsDto) {
    try {
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

      const result = await (this.prisma as any).tour_slots.createMany({
        data: slots,
      });

      return {
        statusCode: 201,
        status: true,
        message: 'Tour slots created successfully.',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTourSlots(query: GetTourSlotsDto) {
    try {
      const { property_id, start_date, end_date } = query;

      const where: any = {};

      if (property_id) {
        where.property_id = property_id;
      }

      if (start_date && end_date) {
        where.tour_date = {
          gte: new Date(start_date),
          lte: new Date(end_date),
        };
      }

      const tourSlots = await this.prisma.tour_slots.findMany({
        where,
        orderBy: {
          tour_date: 'asc',
        },
      });

      // Group slots by date
      const groupedSlots: any = {};

      tourSlots.forEach((slot: any) => {
        const dateKey = slot.tour_date.toISOString().split('T')[0]; // Get YYYY-MM-DD format

        if (!groupedSlots[dateKey]) {
          groupedSlots[dateKey] = [];
        }

        groupedSlots[dateKey].push({
          id: slot.id,
          property_id: slot.property_id,
          tour_date: slot.tour_date,
          is_booked: slot.is_booked,
          is_completed: slot.is_completed,
          created_at: slot.created_at,
          updated_at: slot.updated_at,
        });
      });

      return {
        statusCode: 201,
        status: true,
        message: 'Tour slots retrieved successfully.',
        data: groupedSlots,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAvailableSlots(property_id: string, tour_date: string) {
    try {
      const date = new Date(tour_date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const availableSlots = await this.prisma.tour_slots.findMany({
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

      return {
        statusCode: 201,
        status: true,
        message: 'Available tour slots retrieved successfully.',
        data: availableSlots,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
