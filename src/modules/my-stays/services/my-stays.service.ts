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
import { UploadMyStaysDocumentDto } from '../dto/upload-my-stays-document.dto';
import { GetMyStaysDocumentsDto } from '../dto/get-my-stays-documents.dto';
import { successResponse } from '@/shared/utils/response';
import { WinstonLoggerService } from '@/shared/logger/winston-logger.service';
import { RoommateRequestStatus } from '@/shared/enums/my-stays.enum';
import { Prisma } from '@prisma/client';
import { uploadFileToS3 } from '@/shared/utils/aws';
import { CreateLeaveNoticeDto } from '../dto/create-leave-notice.dto';
import { GetLeaveNoticesDto } from '../dto/get-leave-notices.dto';

@Injectable()
export class MyStaysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLoggerService
  ) {}

  async createResident(tenant_id: string, createResidentDto: CreateResidentDto) {
    try {
      const { property_id, ...residentData } = createResidentDto;
      const resident = await this.prisma.residents.upsert({
        where: {
          // Use the unique constraint we just added
          tenant_id_property_id: {
            tenant_id,
            property_id,
          },
        },
        update: {
          // Update only the fields that are provided (not undefined)
          ...Object.fromEntries(Object.entries(residentData).filter(([_, value]) => value !== undefined)),
        },
        create: {
          ...residentData,
          tenant_id,
          property_id,
        },
      });

      return successResponse('Resident data saved successfully.', resident);
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
      const { property_id, ...tenantStayData } = createTenantStayDto;

      // Single database call using Prisma's upsert
      const tenantStay = await this.prisma.tenant_stays.upsert({
        where: {
          // Use the unique constraint we just added
          tenant_id_property_id: {
            tenant_id,
            property_id,
          },
        },
        update: {
          // Update only the fields that are provided (not undefined)
          ...Object.fromEntries(Object.entries(tenantStayData).filter(([_, value]) => value !== undefined)),
        },
        create: {
          ...tenantStayData,
          tenant_id,
          property_id,
          status: RoommateRequestStatus.PENDING,
        },
      });

      return successResponse('Tenant stay data saved successfully.', tenantStay);
    } catch (error) {
      this.logger.error('Error creating tenant stay', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTenantStays(tenant_id: string, query: GetTenantStaysDto) {
    try {
      const { status } = query;

      const whereClause = status ? `AND ts.status = '${status}'` : '';

      // Single query with joins for flat structure
      const tenantStays = await this.prisma.$queryRaw`
        SELECT 
          ts.id,
          ts.status,
          ts.monthly_rent,
          ts.move_in_date,
          ts.deposit_amount,
          ts.created_at,
          -- Property info
          p.id as property_id,
          p.name as property_name,
         
          -- Property detai
          pd.cable_inclusion,
          pd.water_provider,
          pd.hot_water_tank_provider,
          pd.electricity_inclusion,
          pd.internet_inclusion,
          pd.number_of_parking_spaces,
          pd.number_of_lockers,
          pd.gas_provider,

          -- Tenant info
          t.first_name as tenant_first_name,
          t.last_name as tenant_last_name,
          t.email as tenant_email,
          
          -- Owner info
          o.first_name as owner_first_name,
          o.last_name as owner_last_name,
          o.email as owner_email,
          
          -- Residents info (JSON array)
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', r.id,
                'first_name', r.first_name,
                'sur_name', r.sur_name,
                'email', r.email,
                'residence_type', r.residence_type
              )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'::json
          ) as residents
          
        FROM tenant_stays ts
        LEFT JOIN properties p ON ts.property_id = p.id
        LEFT JOIN property_details pd ON ts.property_id = pd.property_id
        LEFT JOIN tenants t ON ts.tenant_id = t.id
        LEFT JOIN tenants o ON ts.owner_id = o.id
        LEFT JOIN residents r ON t.id = r.tenant_id
        WHERE (ts.tenant_id = ${tenant_id} OR ts.owner_id = ${tenant_id})
        ${whereClause ? Prisma.raw(whereClause) : Prisma.empty}
        GROUP BY 
          ts.id, ts.status, ts.monthly_rent, ts.move_in_date, ts.deposit_amount, ts.created_at,
          p.id, p.name,
          pd.cable_inclusion, pd.water_provider, pd.hot_water_tank_provider, pd.electricity_inclusion, pd.internet_inclusion,
          pd.number_of_parking_spaces, pd.number_of_lockers, pd.gas_provider,
          t.first_name, t.last_name, t.email,
          o.first_name, o.last_name, o.email
        ORDER BY ts.created_at DESC
      `;

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

  // Leave Notice Methods
  async createLeaveNotice(tenant_id: string, createLeaveNoticeDto: CreateLeaveNoticeDto) {
    try {
      const { property_id, ...leaveNoticeData } = createLeaveNoticeDto;

      // Single database call using Prisma's upsert
      const leaveNotice = await this.prisma.leave_notices.upsert({
        where: {
          // Use the unique constraint we just added
          tenant_id_property_id: {
            tenant_id,
            property_id,
          },
        },
        update: {
          // Update only the fields that are provided (not undefined)
          ...Object.fromEntries(Object.entries(leaveNoticeData).filter(([_, value]) => value !== undefined)),
        },
        create: {
          ...leaveNoticeData,
          tenant_id,
          property_id,
        },
      });

      return successResponse('Leave notice data saved successfully.', leaveNotice);
    } catch (error) {
      this.logger.error('Error creating leave notice', error);
      throw new InternalServerErrorException('Something went wrong while creating leave notice.');
    }
  }

  async getLeaveNotices(tenant_id: string, query: GetLeaveNoticesDto) {
    try {
      const { property_id } = query;

      const whereClause: any = {
        OR: [{ tenant_id }, { owner_id: tenant_id }],
      };

      if (property_id) {
        whereClause.property_id = property_id;
      }

      const leaveNotices = await Promise.all([
        this.prisma.leave_notices.findMany({
          where: whereClause,
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            tenant: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.leave_notices.count({
          where: whereClause,
        }),
      ]);

      return successResponse('Leave notices retrieved successfully.', {
        leaveNotices,
      });
    } catch (error) {
      this.logger.error('Error getting leave notices', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // My Stays Documents Methods (Simple Upload & Get)
  async uploadMyStaysDocument(tenant_id: string, uploadDto: UploadMyStaysDocumentDto, files: Express.Multer.File[]) {
    try {
      const { property_id, owner_id, document_type } = uploadDto;

      // Upload ALL files to S3 and create records in ONE transaction
      const uploadPromises = files.map(async file => {
        const uploadResult = await uploadFileToS3(file, 'my-stays', document_type, property_id);

        // Create document record
        return await this.prisma.my_stays_documents.create({
          data: {
            tenant_id,
            property_id,
            owner_id,
            is_uploaded: true,
            document_type,
            image_url: uploadResult.url,
          },
        });
      });

      // Wait for ALL uploads to complete
      const uploadedDocuments = await Promise.all(uploadPromises);

      return successResponse(`${uploadedDocuments.length} documents uploaded successfully.`, uploadedDocuments);
    } catch (error) {
      this.logger.error('Error uploading my stays documents', error);
      throw new InternalServerErrorException('Something went wrong while uploading documents.');
    }
  }

  async getMyStaysDocuments(tenant_id: string, query: GetMyStaysDocumentsDto) {
    try {
      const { property_id, document_type, status } = query;

      const whereClause: any = {
        OR: [{ tenant_id }, { owner_id: tenant_id }],
      };

      if (property_id) {
        whereClause.property_id = property_id;
      }
      if (document_type) {
        whereClause.document_type = document_type;
      }
      if (status) {
        whereClause.status = status;
      }

      const documents = await this.prisma.my_stays_documents.findMany({
        where: whereClause,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          tenant: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return successResponse('My stays documents retrieved successfully.', documents);
    } catch (error) {
      this.logger.error('Error getting my stays documents', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
