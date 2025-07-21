import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PersonalInformationDto, CurrentResidenceDto, AccountInformationDto, SourceOfIncomeDto } from '../dto/account-information.dto';

import { InformationType } from '@/shared/enums/account-details.enum';

@Injectable()
export class AccountInformationService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateAccountInformation(tenantId: string, accountInformationDto: AccountInformationDto) {
    try {
      const { type, data } = accountInformationDto;

      switch (type) {
        case InformationType.PERSONAL_INFORMATION:
          return await this.createOrUpdatePersonalInformation(tenantId, data as PersonalInformationDto);

        case InformationType.CURRENT_RESIDENCE:
          return await this.createOrUpdateCurrentResidence(tenantId, data as CurrentResidenceDto);

        case InformationType.SOURCE_OF_INCOME:
          return await this.createOrUpdateSourceOfIncome(tenantId, data as SourceOfIncomeDto);

        default:
          throw new Error('Invalid information type');
      }
    } catch (error) {
      throw new Error(`Failed to save account information: ${error.message}`);
    }
  }

  private async createOrUpdatePersonalInformation(tenantId: string, data: PersonalInformationDto) {
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
      where: { tenant_id: tenantId },
      update: personalData,
      create: {
        tenant_id: tenantId,
        ...personalData,
      },
    });
  }

  private async createOrUpdateCurrentResidence(tenantId: string, data: CurrentResidenceDto) {
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
      where: { tenant_id: tenantId },
      update: housingData,
      create: {
        tenant_id: tenantId,
        ...housingData,
      },
    });
  }

  private async createOrUpdateSourceOfIncome(tenantId: string, data: SourceOfIncomeDto) {
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
    };

    return await this.prisma.income_sources.upsert({
      where: { tenant_id: tenantId },
      update: sourceOfIncomeData,
      create: {
        tenant_id: tenantId,
        ...sourceOfIncomeData,
      },
    });
  }

  async getAccountInformation(tenantId: string, type?: InformationType) {
    try {
      switch (type) {
        case InformationType.PERSONAL_INFORMATION:
          return await this.getPersonalInformation(tenantId);

        case InformationType.CURRENT_RESIDENCE:
          return await this.getCurrentResidence(tenantId);

        case InformationType.SOURCE_OF_INCOME:
          return await this.getSourceOfIncome(tenantId);

        default:
          // Get all account information
          return await this.getAllAccountInformation(tenantId);
      }
    } catch (error) {
      throw new Error(`Failed to get account information: ${error.message}`);
    }
  }

  private async getPersonalInformation(tenantId: string) {
    const personalInfo = await this.prisma.personal_informations.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!personalInfo) {
      throw new NotFoundException('Personal information not found');
    }

    return personalInfo;
  }

  private async getCurrentResidence(tenantId: string) {
    const housingInfo = await this.prisma.housing_details.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!housingInfo) {
      throw new NotFoundException('Current residence information not found');
    }

    return housingInfo;
  }

  private async getSourceOfIncome(tenantId: string) {
    const incomeInfo = await this.prisma.income_sources.findFirst({
      where: { tenant_id: tenantId },
    });

    if (!incomeInfo) {
      throw new NotFoundException('Source of income information not found');
    }

    return incomeInfo;
  }

  private async getAllAccountInformation(tenantId: string) {
    const [personalInfo, housingInfo, incomeInfo] = await Promise.all([
      this.prisma.personal_informations.findUnique({
        where: { tenant_id: tenantId },
      }),
      this.prisma.housing_details.findUnique({
        where: { tenant_id: tenantId },
      }),
      this.prisma.income_sources.findFirst({
        where: { tenant_id: tenantId },
      }),
    ]);

    return {
      personal_information: personalInfo,
      current_residence: housingInfo,
      source_of_income: incomeInfo,
    };
  }
}
