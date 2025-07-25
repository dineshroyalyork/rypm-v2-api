import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PersonalInformationDto, CurrentResidenceDto, AccountInformationDto, SourceOfIncomeDto, ReferenceDetailsDto, PetsDto, VehiclesDto, EmergencyContactDto, BankDetailsDto,DocumentsDto } from '../dto/account-information.dto';
import { InformationType,SourceOfIncome } from '@/shared/enums/account-details.enum';
import { uploadFile,uploadFileToS3 } from '@/shared/utils/aws';


@Injectable()
export class AccountInformationService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateAccountInformation(tenant_id: string, accountInformationDto: AccountInformationDto) {
    try {
      const { type, data } = accountInformationDto;

      switch (type) {
        case InformationType.PERSONAL_INFORMATION:
          return await this.createOrUpdatePersonalInformation(tenant_id, data as PersonalInformationDto);

        case InformationType.CURRENT_RESIDENCE:
          return await this.createOrUpdateCurrentResidence(tenant_id, data as CurrentResidenceDto);

        case InformationType.SOURCE_OF_INCOME:
          return await this.createOrUpdateSourceOfIncome(tenant_id, data as SourceOfIncomeDto[]);

        case InformationType.REFERENCES:
          return await this.createOrUpdateReferenceDetails(tenant_id, data as ReferenceDetailsDto);

        case InformationType.PETS:
          return await this.createOrUpdatePets(tenant_id, data as PetsDto[]);

        case InformationType.VEHICLE_INFORMATION:
          return await this.createOrUpdateVehicles(tenant_id, data as VehiclesDto);

        case InformationType.EMERGENCY_CONTACT:
          return await this.createOrUpdateEmergencyContact(tenant_id, data as EmergencyContactDto);

        case InformationType.BANK_DETAILS:
          return await this.createOrUpdateBankDetails(tenant_id, data as BankDetailsDto);

        default:
          throw new Error('Invalid information type');
      }
    } catch (error) {
      throw new Error(`Failed to save account information: ${error.message}`);
    }
  }

  private async createOrUpdatePersonalInformation(tenant_id: string, data: PersonalInformationDto) {
    const personalData = {
      first_name: data.first_name,
      middle_name: data.middle_name || '',
      sur_name: data.sur_name,
      email: data.email,
      mobile_number: data.mobile_number,
      gender: data.gender,
      marital_status: data.marital_status,
      credit_score: data.credit_score,
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
  }

  private async createOrUpdateCurrentResidence(tenant_id: string, data: CurrentResidenceDto) {
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
  }

  private async createOrUpdateSourceOfIncome(tenant_id: string, data: SourceOfIncomeDto[]) {
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
      start_date: income.start_date ? new Date(income.start_date) : null,
      monthly_income: income.monthly_income,
      service_provided: income.service_provided ,
      government_program: income.government_program ,
      school_name:
        income.source_of_income === SourceOfIncome.STUDENT_NO_INCOME ||
        income.source_of_income === SourceOfIncome.STUDENT_SUPPORTED_BY_PARENTS
          ? income.employer
          : null,
    }));
  
    const createdRecords = await Promise.all(
      records.map((record) => this.prisma.income_sources.create({ data: record }))
    );
  
    return createdRecords;
  }

  private async createOrUpdateReferenceDetails(tenant_id: string, data: ReferenceDetailsDto) {
    const referenceData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile_number: data.mobile_number,
      relationship: data.relationship,
    };

    return await this.prisma.reference_details.upsert({
      where: { tenant_id: tenant_id },
      update: referenceData,
      create: {
        tenant_id: tenant_id,
        ...referenceData,
      },
    });
  }
  private async createOrUpdatePets(tenant_id: string, data: PetsDto[]) {
    // Step 1: Remove existing pets for the tenant
    await this.prisma.pets.deleteMany({ where: { tenant_id } });
  
    // Step 2: Map incoming array to DB-compatible format
    const petsToCreate = data.map((pet) => ({
      tenant_id,
      has_pet: pet.has_pet,
      pet_type: pet.pet_type,
      breed_type: pet.breed_type,
      weight: pet.weight,
      gender: pet.gender,
      is_neutered: pet.is_neutered,
      animal_description: pet.animal_description,
    }));
  
    // Step 3: Create all new pets
    await this.prisma.pets.createMany({
      data: petsToCreate,
    });
  
    // Step 4: Return the newly inserted records
    return await this.prisma.pets.findMany({ where: { tenant_id } });
  }
  

  private async createOrUpdateVehicles(tenant_id: string, data: VehiclesDto) {
    const vehiclesData = {
      type: data.type,
      make: data.make,
      model: data.model,
      license_plate: data.license_plate,
      car_ownership: data.car_ownership,
    };

    return await this.prisma.vehicles.upsert({
      where: { tenant_id: tenant_id },
      update: vehiclesData,
      create: {
        tenant_id: tenant_id,
        ...vehiclesData,
      },
    });
  }

  private async createOrUpdateEmergencyContact(tenant_id: string, data: EmergencyContactDto) {
    const emergencyContactData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile_number: data.mobile_number,
      relationship: data.relationship,
    };

    return await this.prisma.emergency_contact.upsert({
      where: { tenant_id: tenant_id },
      update: emergencyContactData,
      create: {
        tenant_id: tenant_id,
        ...emergencyContactData,
      },
    });
  }

  private async createOrUpdateBankDetails(tenant_id: string, data: BankDetailsDto) {
    let directDepositFormUrl = data.direct_deposit_form;
    // If direct_deposit_form is a base64 string, upload it and get the URL
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
  }

  async getAccountInformation(tenant_id: string, type?: InformationType) {
    try {
      switch (type) {
        case InformationType.PERSONAL_INFORMATION:
          return await this.getPersonalInformation(tenant_id);

        case InformationType.CURRENT_RESIDENCE:
          return await this.getCurrentResidence(tenant_id);

        case InformationType.SOURCE_OF_INCOME:
          return await this.getSourceOfIncome(tenant_id);

        case InformationType.REFERENCES:
          return await this.getReferenceDetails(tenant_id);

        case InformationType.PETS:
          return await this.getPets(tenant_id);

        case InformationType.VEHICLE_INFORMATION:
          return await this.getVehicles(tenant_id);

        case InformationType.EMERGENCY_CONTACT:
          return await this.getEmergencyContact(tenant_id);

        case InformationType.BANK_DETAILS:
          return await this.getBankDetails(tenant_id);

        case InformationType.DOCUMENTS:
          return await this.getDocuments(tenant_id);

        case InformationType.INTRODUCTORY_VIDEO:
          return await this.getIntroductoryVideo(tenant_id);

        default:
          // Get all account information
          return await this.getAllAccountInformation(tenant_id);
      }
    } catch (error) {
      throw new Error(`Failed to get account information: ${error.message}`);
    }
  }

  private async getPersonalInformation(tenant_id: string) {
    const personalInfo = await this.prisma.personal_informations.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!personalInfo) {
      throw new NotFoundException('Personal information not found');
    }

    return personalInfo;
  }

  private async getCurrentResidence(tenant_id: string) {
    const housingInfo = await this.prisma.housing_details.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!housingInfo) {
      throw new NotFoundException('Current residence information not found');
    }

    return housingInfo;
  }

  private async getSourceOfIncome(tenant_id: string) {
    const incomeInfos = await this.prisma.income_sources.findMany({
      where: { tenant_id },
    });
  
    return incomeInfos ?? []; // fallback to empty array
  }
  

  private async getReferenceDetails(tenant_id: string) {
    const reference = await this.prisma.reference_details.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!reference) {
      throw new NotFoundException('Reference details not found');
    }

    return reference;
  }

  private async getPets(tenant_id: string) {
    const pets = await this.prisma.pets.findMany({
      where: { tenant_id: tenant_id },
    });

    if (!pets || pets.length === 0) {
      throw new NotFoundException('Pets information not found');
    }

    return pets;
  }

  private async getVehicles(tenant_id: string) {
    const vehicles = await this.prisma.vehicles.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!vehicles) {
      throw new NotFoundException('Vehicles information not found');
    }

    return vehicles;
  }

  private async getEmergencyContact(tenant_id: string) {
    const emergencyContact = await this.prisma.emergency_contact.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!emergencyContact) {
      throw new NotFoundException('Emergency contact information not found');
    }

    return emergencyContact;
  }

  private async getBankDetails(tenant_id: string) {
    const bankDetails = await this.prisma.bank_details.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!bankDetails) {
      throw new NotFoundException('Bank details not found');
    }

    return bankDetails;
  }

  private async getDocuments(tenant_id: string) {
    const documents = await this.prisma.document.findMany({
      where: { tenant_id: tenant_id },
    });

    if (!documents || documents.length === 0) {
      throw new NotFoundException('Documents not found');
    }

    return documents;
  }

  private async getIntroductoryVideo(tenant_id: string) {
    const documents = await this.prisma.introductory_video.findMany({
      where: { tenant_id: tenant_id },
    });

    if (!documents || documents.length === 0) {
      throw new NotFoundException('Documents not found');
    }

    return documents;
  }

  private async getAllAccountInformation(tenant_id: string) {
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
      this.prisma.vehicles.findUnique({
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
  }

  async createOrUpdateIntroductoryVideo(
    tenant_id: string,
    file: Express.Multer.File
  ) {
    // Upload the file to S3
    const uploadResult = await uploadFileToS3(
      file,
      'tenants',
      'introductory_video',
      tenant_id
    );
    const s3Key = uploadResult.imageId; // e.g., 'tenants/tenant_xxx/introductory_video/1753365441615_intro.mp4'
    const fileName = s3Key.split('/').pop() || '';

    // Upsert in DB
    return await this.prisma.introductory_video.upsert({
      where: { tenant_id },
      update: {
        url: uploadResult.url,
        file_name: fileName, // Only the file name
        status: 'UPLOADED',
      },
      create: {
        tenant_id,
        url: uploadResult.url,
        file_name: fileName, // Only the file name
        status: 'UPLOADED',
      },
    });
  }
  
  async createOrUpdateDocumentWithType(
    tenant_id: string,
    type: string,
    sub_type: string,
    file: Express.Multer.File
  ) {
    const uploadResult = await uploadFileToS3(
      file,
      'tenants',
      `documents/${type}`, // or sub_type, depending on your S3 structure
      tenant_id
    );
    const fileName = uploadResult.imageId.split('/').pop() || '';

    // Save in your document table
    return await this.prisma.document.upsert({
      where: {
        tenant_id_sub_type: {
          tenant_id,
          // type: type, // or type, depending on your schema
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
        type: type, // or type
        sub_type: sub_type,
        url: uploadResult.url,
        image_id: fileName,
        status: 'UPLOADED',
        is_verified: true,
      },
    });
  }
}
