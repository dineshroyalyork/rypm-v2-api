import { z } from 'zod';
import { personalInformationSchema } from './personal-information.dto';
import { housingInformationSchema } from './housing-information.dto';
import { sourceOfIncomeSchema } from './source-of-income.dto';
import { InformationType } from '@/shared/enums/account-details.enum';

// Main Account Information Schema
export const accountInformationSchema = z.object({
  type: z.nativeEnum(InformationType, {
    required_error: 'Please specify the type of information (personal_information or current_residence)',
  }),
  data: z.union([personalInformationSchema, housingInformationSchema, sourceOfIncomeSchema]),
});

export type AccountInformationDto = z.infer<typeof accountInformationSchema>;
export type PersonalInformationDto = z.infer<typeof personalInformationSchema>;
export type CurrentResidenceDto = z.infer<typeof housingInformationSchema>;
export type SourceOfIncomeDto = z.infer<typeof sourceOfIncomeSchema>;
