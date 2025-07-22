import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PersonalInformationDto, CurrentResidenceDto, AccountInformationDto, SourceOfIncomeDto, ReferenceDetailsDto, PetsDto, VehiclesDto, EmergencyContactDto, BankDetailsDto,DocumentsDto } from '../dto/account-information.dto';
import { documentsSchema } from '../dto/documents.dto';

import { InformationType } from '@/shared/enums/account-details.enum';


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
          return await this.createOrUpdateSourceOfIncome(tenant_id, data as SourceOfIncomeDto);

        case InformationType.REFERENCES:
          return await this.createOrUpdateReferenceDetails(tenant_id, data as ReferenceDetailsDto);

        case InformationType.PETS:
          return await this.createOrUpdatePets(tenant_id, data as PetsDto);

        case InformationType.VEHICLE_INFORMATION:
          return await this.createOrUpdateVehicles(tenant_id, data as VehiclesDto);

        case InformationType.EMERGENCY_CONTACT:
          return await this.createOrUpdateEmergencyContact(tenant_id, data as EmergencyContactDto);

        case InformationType.BANK_DETAILS:
          return await this.createOrUpdateBankDetails(tenant_id, data as BankDetailsDto);

        case InformationType.DOCUMENTS:
          return await this.createOrUpdateDocuments(tenant_id, data as DocumentsDto);

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

  private async createOrUpdateSourceOfIncome(tenant_id: string, data: SourceOfIncomeDto) {
    const sourceOfIncomeData = {
      source_of_income: data.source_of_income,
      employer: data.employer,
      manager_name: data.manager_name,
      manager_phone_number: data.manager_phone_number,
      manager_email: data.manager_email,
      position_title: data.position_title,
      occupation: data.occupation,
      start_date: data.start_date ? new Date(data.start_date) : null,
      monthly_income: data.monthly_income,
      // Additional fields can be added based on source_of_income type
      service_provided: data.source_of_income === 'Self_Employed' ? data.occupation : null,
      government_program: data.source_of_income === 'Government_Assistance' ? data.employer : null,
      school_name: data.source_of_income === 'Student_No_Income' || data.source_of_income === 'Student_Supported_By_Parents' ? data.employer : null,
      additional_income_id: data.additional_income_id,
    };

    return await this.prisma.income_sources.upsert({
      where: { tenant_id: tenant_id },
      update: sourceOfIncomeData,
      create: {
        tenant_id: tenant_id,
        ...sourceOfIncomeData,
      },
    });
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

  private async createOrUpdatePets(tenant_id: string, data: PetsDto) {
    const petsData = {
      has_pet: data.has_pet,
      pet_type: data.pet_type,
      breed_type: data.breed_type,
      weight: data.weight,
      gender: data.gender,
      is_neutered: data.is_neutered,
      animal_description: data.animal_description,
    };

    return await this.prisma.pets.upsert({
      where: { tenant_id: tenant_id },
      update: petsData,
      create: {
        tenant_id: tenant_id,
        ...petsData,
      },
    });
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
    const bankDetailsData = {
      account_holder_name: data.account_holder_name,
      bank_name: data.bank_name,
      account_number: data.account_number,
      transit_number: data.transit_number,
      branch_address: data.branch_address,
      institution_number: data.institution_number
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

  private async createOrUpdateDocuments(tenantId: string, data: DocumentsDto) {
    const parsed = documentsSchema.parse(data);
  
    const firstEntry = Object.entries(parsed).find(([_, url]) => typeof url === 'string');
  
    if (!firstEntry) {
      throw new Error('No valid document URL found');
    }
  
    const [key, fileUrl] = firstEntry;
  
    return await this.prisma.documents.upsert({
      where: { tenant_id: tenantId },
      update: {
        document_type: key,
        file_url: fileUrl,
        status: 'UPLOADED',
        document_for: key.includes('corporate') ? 'CORPORATE' : 'PERSONAL',
        is_required: true,
      },
      create: {
        tenant_id: tenantId,
        document_type: key,
        file_url: fileUrl,
        status: 'UPLOADED',
        document_for: key.includes('corporate') ? 'CORPORATE' : 'PERSONAL',
        is_required: true,
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
    const incomeInfo = await this.prisma.income_sources.findFirst({
      where: { tenant_id: tenant_id },
      include: {
        additional_income_sources: true, // <-- Add this line
      },
    });

    if (!incomeInfo) {
      throw new NotFoundException('Source of income information not found');
    }

    return incomeInfo;
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
    const pets = await this.prisma.pets.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!pets) {
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
    const documents = await this.prisma.documents.findUnique({
      where: { tenant_id: tenant_id },
    });

    if (!documents) {
      throw new NotFoundException('Documents not found');
    }

    return documents;
  }

  private async getAllAccountInformation(tenant_id: string) {
    const [personalInfo, housingInfo, incomeInfo, referenceInfo, petsInfo, vehiclesInfo, emergencyContactInfo, bankDetailsInfo, documentsInfo] = await Promise.all([
      this.prisma.personal_informations.findUnique({
        where: { tenant_id: tenant_id },
      }),
      this.prisma.housing_details.findUnique({
        where: { tenant_id: tenant_id },
      }),
      this.prisma.income_sources.findFirst({
        where: { tenant_id: tenant_id },
      }),
      this.prisma.reference_details.findUnique({
        where: { tenant_id: tenant_id },
      }),
      this.prisma.pets.findUnique({
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
      this.prisma.documents.findUnique({
        where: { tenant_id: tenant_id },
      }),
    ]);

    return {
      personal_information: personalInfo,
      current_residence: housingInfo,
      source_of_income: incomeInfo,
      references: referenceInfo,
      pets: petsInfo,
      vehicles: vehiclesInfo,
      emergency_contact: emergencyContactInfo,
      bank_details: bankDetailsInfo,
      documents: documentsInfo,
    };
  }
}
