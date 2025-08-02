import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PersonalInformationDto, CurrentResidenceDto, AccountInformationDto, SourceOfIncomeDto, ReferenceDetailsDto, PetsDto, VehiclesDto, EmergencyContactDto, BankDetailsDto,DocumentsDto } from '../dto/account-information.dto';
import { IdentityVerificationArrayDto, UploadIdentityVerificationDto, DeleteIdentityVerificationDto } from '../dto/identity-verification.dto';
import { InformationType,SourceOfIncome } from '@/shared/enums/account-details.enum';
import { uploadFile,uploadFileToS3 } from '@/shared/utils/aws';
import { WinstonLoggerService } from '@/shared/logger/winston-logger.service';



@Injectable()
export class AccountInformationService {
  constructor(private readonly prisma: PrismaService,
    private logger: WinstonLoggerService) {}

  async createOrUpdateAccountInformation(tenant_id: string, accountInformationDto: AccountInformationDto) {
    try {
      const { type, data } = accountInformationDto;
      
      let result;
      switch (type) {
        case InformationType.PERSONAL_INFORMATION:
          result = await this.createOrUpdatePersonalInformation(tenant_id, data as PersonalInformationDto);
          break;
        case InformationType.CURRENT_RESIDENCE:
          result = await this.createOrUpdateCurrentResidence(tenant_id, data as CurrentResidenceDto);
          break;
        case InformationType.SOURCE_OF_INCOME:
          result = await this.createOrUpdateSourceOfIncome(tenant_id, data as SourceOfIncomeDto[]);
          break;
        case InformationType.REFERENCES:
          result = await this.createOrUpdateReferenceDetails(tenant_id, data as ReferenceDetailsDto);
          break;
        case InformationType.PETS:
          result = await this.createOrUpdatePets(tenant_id, data as PetsDto[]);
          break;
        case InformationType.VEHICLE_INFORMATION:
          result = await this.createOrUpdateVehicles(tenant_id, data as VehiclesDto);
          break;
        case InformationType.EMERGENCY_CONTACT:
          result = await this.createOrUpdateEmergencyContact(tenant_id, data as EmergencyContactDto);
          break;
        case InformationType.BANK_DETAILS:
          result = await this.createOrUpdateBankDetails(tenant_id, data as BankDetailsDto);
          break;
        default:
          return {
            statusCode: 400,
            success: false,
            message: 'Invalid information type',
            data: null,
          };
      }
      
      return {
        statusCode: 200,
        success: true,
        message: 'Account information saved successfully',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: 500,
        success: false,
        message: `Failed to save account information: ${error.message}`,
        data: null,
      };
    }
  }

  private async createOrUpdatePersonalInformation(tenant_id: string, data: PersonalInformationDto) {
    try {
      const personalData = {
        first_name: data.first_name,
        middle_name: data.middle_name || '',
        sur_name: data.sur_name,
        email: data.email,
        mobile_number: data.mobile_number,
        country_code: data.country_code,
        gender: data.gender,
        marital_status: data.marital_status,
        credit_score: data.credit_score , // Convert to string
        government_id_name: data.government_id_name,
        government_id_number: data.government_id_number,
        social_insurance_number: data.social_insurance_number,
      };
      return await this.prisma.personal_informations.upsert({
        where: { tenant_id: tenant_id },
        update: personalData,
        create: {
          tenant_id: tenant_id,
          ...personalData,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save current residence:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async createOrUpdateCurrentResidence(tenant_id: string, data: CurrentResidenceDto) {
    try {
      const housingData = {
        housing_status: data.housing_status,
        living_since: data.living_since ? new Date(data.living_since) : new Date(),
        address_line_1: data.address_line_1 || '',
        address_line_2: data.address_line_2,
        city: data.city || '',
        province: data.province || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
        landlord_first_name: data.landlord_first_name,
        landlord_Last_name: data.landlord_Last_name,
        landlord_phone_number: data.landlord_phone_number,
        landlord_country_code: data.landlord_country_code,
        landlord_email: data.landlord_email,
        rent_amount: data.rent_amount,
        mortgage_amount: data.mortgage_amount,
        payment_obligation: data.payment_obligation,
        bedroom: data.bedroom,
        bathroom: data.bathroom,
      };
      return await this.prisma.housing_details.upsert({
        where: { tenant_id: tenant_id },
        update: housingData,
        create: {
          tenant_id: tenant_id,
          ...housingData,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save current residence:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async createOrUpdateSourceOfIncome(tenant_id: string, data: SourceOfIncomeDto[]) {
    try {
      await this.prisma.income_sources.deleteMany({ where: { tenant_id } });
      const records = data.map((income) => ({
        tenant_id,
        source_of_income: income.source_of_income,
        employer: income.employer,
        manager_name: income.manager_name,
        manager_phone_number: income.manager_phone_number,
        manager_email: income.manager_email,
        position_title: income.position_title,
        occupation: income.occupation,
        country_code: income.country_code,
        start_date: income.start_date ? new Date(income.start_date) : null,
        monthly_income: income.monthly_income,
        service_provided: income.service_provided ,
        government_program: income.government_program ,
        school_name: income.school_name ?? "",
      }));
      const createdRecords = await Promise.all(
        records.map((record) => this.prisma.income_sources.create({ data: record }))
      );
      return createdRecords;
    } catch (error) {
      this.logger.error('Failed to save current residence:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async createOrUpdateReferenceDetails(tenant_id: string, data: ReferenceDetailsDto) {
    try {
      const referenceData = {
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        mobile_number: data.mobile_number ?? "",
        relationship: data.relationship ?? "",
        country_code: data.country_code ?? "",
      };
      return await this.prisma.reference_details.upsert({
        where: { tenant_id: tenant_id },
        update: referenceData,
        create: {
          tenant_id: tenant_id,
          ...referenceData,
        },
      });
    } catch (error) {
      throw new Error(`Failed to save reference details: ${error.message}`);
    }
  }

  private async createOrUpdatePets(tenant_id: string, data: PetsDto[]) {
    try {
      await this.prisma.pets.deleteMany({ where: { tenant_id } });
      const petsToCreate = data.map((pet) => ({
        tenant_id,
        has_pet: pet.has_pet ?? "",
        pet_type: pet.pet_type ?? "",
        breed_type: pet.breed_type ?? "",
        weight: pet.weight ?? "",
        gender: pet.gender ?? "",
        is_neutered: pet.is_neutered ?? "",
        animal_description: pet.animal_description ?? "",
      }));
      await this.prisma.pets.createMany({
        data: petsToCreate,
      });
      return await this.prisma.pets.findMany({ where: { tenant_id } });
    } catch (error) {
      this.logger.error('Failed to save current residence:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async createOrUpdateVehicles(tenant_id: string, data: VehiclesDto) {
    try {
      await this.prisma.vehicles.deleteMany({ where: { tenant_id } });
      const vehiclesToCreate = data.map((vehicle) => ({
        tenant_id,
        type: vehicle.type ?? "",
        make: vehicle.make ?? "",
        model: vehicle.model ?? "",
        license_plate: vehicle.license_plate ?? "",
        car_ownership: vehicle.car_ownership ?? "",
      }));
      await this.prisma.vehicles.createMany({
        data: vehiclesToCreate,
      });
      return await this.prisma.vehicles.findMany({ where: { tenant_id } });
    } catch (error) {
      this.logger.error('Failed to save vehicles:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async createOrUpdateEmergencyContact(tenant_id: string, data: EmergencyContactDto) {
    try {
      const emergencyContactData = {
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        mobile_number: data.mobile_number ?? "",
        relationship: data.relationship ?? "",
        country_code: data.country_code ?? ""
      };
      return await this.prisma.emergency_contact.upsert({
        where: { tenant_id: tenant_id },
        update: emergencyContactData,
        create: {
          tenant_id: tenant_id,
          ...emergencyContactData,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save current residence:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async createOrUpdateBankDetails(tenant_id: string, data: BankDetailsDto) {
    try {
      let directDepositFormUrl = data.direct_deposit_form;
      if (directDepositFormUrl && typeof directDepositFormUrl === 'string' && directDepositFormUrl.startsWith('data:image/')) {
        const uploadResult = await uploadFile(
          directDepositFormUrl,
          'tenants',
          'direct_deposit_forms',
          tenant_id
        );
        directDepositFormUrl = uploadResult.url;
      }
      const bankDetailsData = {
        account_holder_name: data.account_holder_name,
        bank_name: data.bank_name,
        account_number: data.account_number,
        transit_number: data.transit_number,
        branch_address: data.branch_address,
        institution_number: data.institution_number,
        direct_deposit_form: directDepositFormUrl,
      };
      return await this.prisma.bank_details.upsert({
        where: { tenant_id: tenant_id },
        update: bankDetailsData,
        create: {
          tenant_id: tenant_id,
          ...bankDetailsData,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save current residence:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async getAccountInformation(tenant_id: string, type?: InformationType) {
    try {
      let result;
      switch (type) {
        case InformationType.PERSONAL_INFORMATION:
          result = await this.getPersonalInformation(tenant_id);
          break;
        case InformationType.CURRENT_RESIDENCE:
          result = await this.getCurrentResidence(tenant_id);
          break;
        case InformationType.SOURCE_OF_INCOME:
          result = await this.getSourceOfIncome(tenant_id);
          break;
        case InformationType.REFERENCES:
          result = await this.getReferenceDetails(tenant_id);
          break;
        case InformationType.PETS:
          result = await this.getPets(tenant_id);
          break;
        case InformationType.VEHICLE_INFORMATION:
          result = await this.getVehicles(tenant_id);
          break;
        case InformationType.EMERGENCY_CONTACT:
          result = await this.getEmergencyContact(tenant_id);
          break;
        case InformationType.BANK_DETAILS:
          result = await this.getBankDetails(tenant_id);
          break;
        case InformationType.DOCUMENTS:
          result = await this.getDocuments(tenant_id);
          break;
        case InformationType.INTRODUCTORY_VIDEO:
          result = await this.getIntroductoryVideo(tenant_id);
          break;
        default:
          result = await this.getAllAccountInformation(tenant_id);
          break;
      }
      
      return {
        statusCode: 200,
        success: true,
        message: type ? `${type.replace(/_/g, ' ').toLowerCase()} retrieved successfully` : 'All account information retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get account information:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  private async getPersonalInformation(tenant_id: string) {
    try {
      const personalInfo = await this.prisma.personal_informations.findUnique({
        where: { tenant_id: tenant_id },
      });
      if (!personalInfo) {
        throw new NotFoundException('Personal information not found');
      }
      return personalInfo;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get personal information: ${error.message}`);
    }
  }

  private async getCurrentResidence(tenant_id: string) {
    try {
      const housingInfo = await this.prisma.housing_details.findUnique({
        where: { tenant_id: tenant_id },
      });
      if (!housingInfo) {
        throw new NotFoundException('Current residence information not found');
      }
      return housingInfo;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get current residence: ${error.message}`);
    }
  }

  private async getSourceOfIncome(tenant_id: string) {
    try {
      const incomeInfos = await this.prisma.income_sources.findMany({
        where: { tenant_id },
      });
      return incomeInfos ?? [];
    } catch (error) {
      throw new Error(`Failed to get source of income: ${error.message}`);
    }
  }

  private async getReferenceDetails(tenant_id: string) {
    try {
      const reference = await this.prisma.reference_details.findUnique({
        where: { tenant_id: tenant_id },
      });
      if (!reference) {
        throw new NotFoundException('Reference details not found');
      }
      return reference;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get reference details: ${error.message}`);
    }
  }

  private async getPets(tenant_id: string) {
    try {
      const pets = await this.prisma.pets.findMany({
        where: { tenant_id: tenant_id },
      });
      if (!pets || pets.length === 0) {
        throw new NotFoundException('Pets information not found');
      }
      return pets;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get pets: ${error.message}`);
    }
  }

  private async getVehicles(tenant_id: string) {
    try {
      const vehicles = await this.prisma.vehicles.findMany({
        where: { tenant_id: tenant_id },
      });
      if (!vehicles) {
        throw new NotFoundException('Vehicles information not found');
      }
      return vehicles;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get vehicles: ${error.message}`);
    }
  }

  private async getEmergencyContact(tenant_id: string) {
    try {
      const emergencyContact = await this.prisma.emergency_contact.findUnique({
        where: { tenant_id: tenant_id },
      });
      if (!emergencyContact) {
        throw new NotFoundException('Emergency contact information not found');
      }
      return emergencyContact;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get emergency contact: ${error.message}`);
    }
  }

  private async getBankDetails(tenant_id: string) {
    try {
      const bankDetails = await this.prisma.bank_details.findUnique({
        where: { tenant_id: tenant_id },
      });
      if (!bankDetails) {
        throw new NotFoundException('Bank details not found');
      }
      return bankDetails;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get bank details: ${error.message}`);
    }
  }

  private async getDocuments(tenant_id: string) {
    try {
      const documents = await this.prisma.document.findMany({
        where: { tenant_id: tenant_id },
      });
      if (!documents || documents.length === 0) {
        throw new NotFoundException('Documents not found');
      }
      return documents;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  private async getIntroductoryVideo(tenant_id: string) {
    try {
      const documents = await this.prisma.introductory_video.findMany({
        where: { tenant_id: tenant_id },
      });
      if (!documents || documents.length === 0) {
        throw new NotFoundException('Documents not found');
      }
      return documents;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to get introductory video: ${error.message}`);
    }
  }

  private async getAllAccountInformation(tenant_id: string) {
    try {
      const [personalInfo, housingInfo, incomeInfos, referenceInfo, petsInfos, vehiclesInfo, emergencyContactInfo, bankDetailsInfo, documentsInfo] = await Promise.all([
        this.prisma.personal_informations.findUnique({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.housing_details.findUnique({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.income_sources.findMany({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.reference_details.findUnique({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.pets.findMany({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.vehicles.findMany({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.emergency_contact.findUnique({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.bank_details.findUnique({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.document.findMany({
          where: { tenant_id: tenant_id },
        }),
        this.prisma.introductory_video.findMany({
          where: { tenant_id: tenant_id },
        }),
      ]);
      return {
        personal_information: personalInfo,
        current_residence: housingInfo,
        source_of_income: incomeInfos,
        references: referenceInfo,
        pets: petsInfos,
        vehicles: vehiclesInfo,
        emergency_contact: emergencyContactInfo,
        bank_details: bankDetailsInfo,
        documents: documentsInfo,
      };
    } catch (error) {
      throw new Error(`Failed to get all account information: ${error.message}`);
    }
  }

  async createOrUpdateIntroductoryVideo(
    tenant_id: string,
    file: Express.Multer.File
  ) {
    try {
      const uploadResult = await uploadFileToS3(
        file,
        'tenants',
        'introductory_video',
        tenant_id
      );
      const s3Key = uploadResult.imageId;
      const fileName = s3Key.split('/').pop() || '';
      return await this.prisma.introductory_video.upsert({
        where: { tenant_id },
        update: {
          url: uploadResult.url,
          file_name: fileName,
          status: 'UPLOADED',
        },
        create: {
          tenant_id,
          url: uploadResult.url,
          file_name: fileName,
          status: 'UPLOADED',
        },
      });
    } catch (error) {
      throw new Error(`Failed to save introductory video: ${error.message}`);
    }
  }
  
  async createOrUpdateDocumentWithType(
    tenant_id: string,
    type: string,
    sub_type: string,
    file: Express.Multer.File
  ) {
    try {
      const uploadResult = await uploadFileToS3(
        file,
        'tenants',
        `documents/${type}`,
        tenant_id
      );
      const fileName = uploadResult.imageId.split('/').pop() || '';
      return await this.prisma.document.upsert({
        where: {
          tenant_id_sub_type: {
            tenant_id,
            sub_type: sub_type
          },
        },
        update: {
          url: uploadResult.url,
          image_id: fileName,
          status: 'UPLOADED',
        },
        create: {
          tenant_id,
          type: type,
          sub_type: sub_type,
          url: uploadResult.url,
          image_id: fileName,
          status: 'UPLOADED',
          is_verified: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to save document: ${error.message}`);
    }
  }

  async deleteDocument(tenant_id: string, type: string, sub_type?: string) {
    try {
      // Find the document to delete using the correct unique constraint
      const document = await this.prisma.document.findUnique({
        where: {
          tenant_id_sub_type: {
            tenant_id,
            sub_type: sub_type || '',
          },
        },
      });

      if (!document) {
        return {
          statusCode: 404,
          success: false,
          message: 'Document not found',
          data: null,
        };
      }

      // Verify the document type matches
      if (document.type !== type) {
        return {
          statusCode: 404,
          success: false,
          message: 'Document not found with specified type',
          data: null,
        };
      }

      // Delete the document from database
      await this.prisma.document.delete({
        where: {
          tenant_id_sub_type: {
            tenant_id,
            sub_type: sub_type || '',
          },
        },
      });

      // Note: S3 file deletion would go here if needed
      // await deleteFileFromS3(document.image_id);

      return {
        statusCode: 200,
        success: true,
        message: 'Document deleted successfully',
        data: {
          deleted_document: {
            id: document.id,
            type: document.type,
            sub_type: document.sub_type,
            url: document.url,
            image_id: document.image_id,
          },
        },
      };
    } catch (error) {
      this.logger.error('Failed to delete document:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  // Identity Verification Methods
  async createOrUpdateIdentityVerification(
    tenant_id: string,
    identityVerificationData: IdentityVerificationArrayDto
  ) {
    try {
      // Delete existing identity verification records for this tenant
      await this.prisma.identity_verification.deleteMany({
        where: { tenant_id },
      });

      // Create new identity verification records
      const identityVerifications = await Promise.all(
        identityVerificationData.map(async (data) => {
          return await this.prisma.identity_verification.create({
            data: {
              tenant_id,
              type: data.type,
              sub_type: data.sub_type,
              url: data.url || null,
              image_id: data.image_id || null,
              status: data.status || 'pending',
              notes: data.notes || null,
            },
          });
        })
      );

      return {
        statusCode: 200,
        success: true,
        message: 'Identity verification records saved successfully',
        data: identityVerifications,
      };
    } catch (error) {
      this.logger.error('Failed to save identity verification:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async uploadIdentityVerification(
    tenant_id: string,
    type: string,
    sub_type: string,
    file: Express.Multer.File
  ) {
    try {
      // Upload file to S3
      const uploadResult = await uploadFileToS3(file, 'identity-verification');

      // Check if record exists
      const existingRecord = await this.prisma.identity_verification.findFirst({
        where: {
          tenant_id,
          type,
          sub_type,
        },
      });

      let identityVerification;
      if (existingRecord) {
        // Update existing record
        identityVerification = await this.prisma.identity_verification.update({
          where: { id: existingRecord.id },
          data: {
            url: uploadResult.url,
            image_id: uploadResult.imageId,
            status: 'pending',
            updated_at: new Date(),
          },
        });
      } else {
        // Create new record
        identityVerification = await this.prisma.identity_verification.create({
          data: {
            tenant_id,
            type,
            sub_type,
            url: uploadResult.url,
            image_id: uploadResult.imageId,
            status: 'pending',
          },
        });
      }

      return {
        statusCode: 200,
        success: true,
        message: 'Identity verification document uploaded successfully',
        data: identityVerification,
      };
    } catch (error) {
      this.logger.error('Failed to upload identity verification:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async getIdentityVerification(tenant_id: string) {
    try {
      const identityVerifications = await this.prisma.identity_verification.findMany({
        where: { tenant_id },
        orderBy: { created_at: 'desc' },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Identity verification records retrieved successfully',
        data: identityVerifications,
      };
    } catch (error) {
      this.logger.error('Failed to get identity verification:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  async deleteIdentityVerification(tenant_id: string, id: string) {
    try {
      // Check if the identity verification record belongs to the tenant
      const existingRecord = await this.prisma.identity_verification.findFirst({
        where: { id, tenant_id },
      });

      if (!existingRecord) {
        return {
          statusCode: 404,
          success: false,
          message: 'Identity verification record not found or access denied',
          data: null,
        };
      }

      // Delete the record
      await this.prisma.identity_verification.delete({
        where: { id },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Identity verification record deleted successfully',
        data: null,
      };
    } catch (error) {
      this.logger.error('Failed to delete identity verification:', error.stack);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }
}
