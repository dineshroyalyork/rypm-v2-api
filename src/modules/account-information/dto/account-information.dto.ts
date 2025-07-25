import { z } from 'zod';
import { personalInformationSchema } from './personal-information.dto';
import { housingInformationSchema } from './housing-information.dto';
import { sourceOfIncomeSchema, sourceOfIncomeArraySchema } from './source-of-income.dto';
import { referenceDetailsSchema } from './reference-details.dto';
import { InformationType } from '@/shared/enums/account-details.enum';
import { petsSchema, petsArraySchema } from './pets.dto';
import { vehiclesSchema } from './vehicles.dto';
import { emergencyContactSchema } from './emergency-contact.dto';
import { bankDetailsSchema } from './bank-details.dto';
import { documentsSchema } from './documents.dto';

// Main Account Information Schema
export const accountInformationSchema = z.object({
  type: z.nativeEnum(InformationType).refine(val => val !== undefined, {
    message: 'Please specify the type of information (personal_information or current_residence)',
  }),
  data: z.union([
    personalInformationSchema,
    housingInformationSchema,
    sourceOfIncomeSchema,
    sourceOfIncomeArraySchema,
    referenceDetailsSchema,
    petsSchema,
    petsArraySchema,
    vehiclesSchema,
    emergencyContactSchema,
    bankDetailsSchema,
    documentsSchema,
  ]),
});

export type AccountInformationDto = z.infer<typeof accountInformationSchema>;
export type PersonalInformationDto = z.infer<typeof personalInformationSchema>;
export type CurrentResidenceDto = z.infer<typeof housingInformationSchema>;
export type SourceOfIncomeDto = z.infer<typeof sourceOfIncomeSchema>;
export type ReferenceDetailsDto = z.infer<typeof referenceDetailsSchema>;
export type PetsDto = z.infer<typeof petsSchema>;
export type VehiclesDto = z.infer<typeof vehiclesSchema>;
export type EmergencyContactDto = z.infer<typeof emergencyContactSchema>;
export type BankDetailsDto = z.infer<typeof bankDetailsSchema>;
export type DocumentsDto = z.infer<typeof documentsSchema>;
