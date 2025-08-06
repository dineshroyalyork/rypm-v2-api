import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateResidentDto } from '../dto/create-resident.dto';
import { GetResidentsDto } from '../dto/get-residents.dto';
import { SendRoommateRequestDto } from '../dto/send-roommate-request.dto';
import { UpdateRoommateRequestDto } from '../dto/update-roommate-request.dto';
import { GetRoommateRequestsDto } from '../dto/get-roommate-requests.dto';
import { CreateTenantStayDto } from '../dto/create-tenant-stay.dto';
import { UpdateTenantStayDto } from '../dto/update-tenant-stay.dto';
import { GetTenantStaysDto } from '../dto/get-tenant-stays.dto';
import { successResponse } from '@/shared/utils/response';
import { WinstonLoggerService } from '@/shared/logger/winston-logger.service';
import { RoommateRequestStatus } from '@/shared/enums/my-stays.enum';

@Injectable()
export class MyStaysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLoggerService
  ) {}

  async createResident(tenant_id: string, createResidentDto: CreateResidentDto) {
    try {
      const resident = await this.prisma.residents.create({
        data: {
          ...createResidentDto,
          tenant_id,
        },
      });

      return successResponse('Resident created successfully.', resident);
    } catch (error) {
      this.logger.error('Error creating resident', error);
      throw new InternalServerErrorException('Something went wrong while creating resident.');
    }
  }

  async getResidents(tenant_id: string, query: GetResidentsDto) {
    try {
      const { property_id } = query;

      const residents = await this.prisma.residents.findMany({
        where: { tenant_id, property_id },
        select: {
          id: true,
          first_name: true,
          middle_name: true,
          sur_name: true,
          property_id: true,
          tenant_id: true,
          residence_type: true,
          profile_picture: true,
          tenant: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      if (!residents) {
        throw new NotFoundException('No residents found.');
      }

      return successResponse('Residents retrieved successfully.', residents);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting residents', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getResidentById(tenant_id: string, id: string) {
    try {
      const resident = await this.prisma.residents.findFirst({
        where: { id },
      });

      return successResponse('Resident retrieved successfully.', resident);
    } catch (error) {
      this.logger.error('Error getting resident by ID', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Roommate Request Methods
  async sendRoommateRequest(tenant_id: string, sendRoommateRequestDto: SendRoommateRequestDto) {
    try {
      const { property_id, roommate_id } = sendRoommateRequestDto;

      // Check if roommate exists
      const roommate = await this.prisma.tenants.findUnique({
        where: { id: roommate_id },
      });

      if (!roommate) {
        throw new NotFoundException('Roommate not found');
      }

      // Check if request already exists
      const existingRequest = await this.prisma.roommates.findFirst({
        where: {
          tenant_id,
          roommate_id,
          property_id,
        },
      });

      if (existingRequest) {
        throw new NotFoundException('Roommate request already exists');
      }

      const roommateRequest = await this.prisma.roommates.create({
        data: { ...sendRoommateRequestDto, status: RoommateRequestStatus.PENDING, tenant_id },
      });

      return successResponse('Roommate request sent successfully.', roommateRequest);
    } catch (error) {
      this.logger.error('Error sending roommate request', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRoommateRequests(tenant_id: string, query: GetRoommateRequestsDto) {
    try {
      const { status } = query;

      const whereClause: any = {
        OR: [{ tenant_id }, { roommate_id: tenant_id }],
      };

      if (status) {
        whereClause.status = status;
      }

      const requests = await this.prisma.roommates.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          roommate: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return successResponse('Roommate requests retrieved successfully.', requests);
    } catch (error) {
      this.logger.error('Error getting roommate requests', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateRoommateRequest(tenant_id: string, updateRoommateRequestDto: UpdateRoommateRequestDto) {
    try {
      const { request_id, status } = updateRoommateRequestDto;

      const updatedRequest = await this.prisma.roommates.update({
        where: {
          id: request_id,
          roommate_id: tenant_id,
        },
        data: { status },
      });

      return successResponse(`Roommate request ${status} successfully.`, updatedRequest);
    } catch (error) {
      this.logger.error('Error updating roommate request', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Tenant Stay Methods
  async createTenantStay(tenant_id: string, createTenantStayDto: CreateTenantStayDto) {
    try {
      const tenantStay = await this.prisma.tenant_stays.create({
        data: {
          ...createTenantStayDto,
          tenant_id,
          status: RoommateRequestStatus.PENDING,
        },
      });

      return successResponse('Tenant stay request created successfully.', tenantStay);
    } catch (error) {
      this.logger.error('Error creating tenant stay', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTenantStays(tenant_id: string, query: GetTenantStaysDto) {
    try {
      const { status } = query;

      const whereClause: any = {
        OR: [{ tenant_id }, { owner_id: tenant_id }],
      };

      if (status) {
        whereClause.status = status;
      }

      const tenantStays = await this.prisma.tenant_stays.findMany({
        where: whereClause,
        include: {
          property: true,
          tenant: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return successResponse('Tenant stays retrieved successfully.', tenantStays);
    } catch (error) {
      this.logger.error('Error getting tenant stays', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateTenantStay(tenant_id: string, updateTenantStayDto: UpdateTenantStayDto) {
    try {
      const { stay_id, status } = updateTenantStayDto;

      const updatedStay = await this.prisma.tenant_stays.update({
        where: {
          id: stay_id,
          owner_id: tenant_id, // Only owner can update
        },
        data: { status },
      });

      return successResponse(`Tenant stay ${status} successfully.`, updatedStay);
    } catch (error) {
      this.logger.error('Error updating tenant stay', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
