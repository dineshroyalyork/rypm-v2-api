import { z } from 'zod';
import { SourceOfIncome } from '@/shared/enums/account-details.enum';

/**
 * Schema for a single source of income (keep this)
 */
export const sourceOfIncomeSchema = z
  .object({
    source_of_income: z.nativeEnum(SourceOfIncome).refine(val => val !== undefined, {
      message: 'Please select your source of income',
    }),
    employer: z.string().optional(),
    occupation: z.string().optional(),
    position_title: z.string().optional(),
    start_date: z.string().optional(),
    monthly_income: z.number().positive('Monthly income must be positive').optional(),
    manager_name: z.string().optional(),
    country_code: z.string().optional(),
    school_name: z.string().optional(),
    manager_phone_number: z.string().optional(),
    manager_email: z.string().email('Please enter a valid email address').optional(),
    service_provided: z.string().optional(),
    government_program: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const addError = (path: string[], message: string) => {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path });
    };

    switch (data.source_of_income) {
      case SourceOfIncome.EMPLOYED:
        if (!data.employer || !data.occupation || !data.position_title || !data.start_date || !data.monthly_income) {
          addError(['employer'], 'Employer, occupation, position title, start date, and monthly income are required for employed status');
        }
        if (!data.manager_name || !data.manager_phone_number || !data.manager_email) {
          addError(['manager_name'], 'Manager details are required for employed status');
        }
        break;

      case SourceOfIncome.SELF_EMPLOYED:
        if (!data.occupation || !data.service_provided || !data.monthly_income) {
          addError(['occupation'], 'Occupation, start date, and income required for self-employed');
        }
        break;

      case SourceOfIncome.GOVERNMENT_ASSISTANCE:
      case SourceOfIncome.STUDENT_SUPPORTED_BY_PARENTS:
        if (!data.monthly_income) {
          addError(['monthly_income'], 'Monthly income is required');
        }
        break;

      case SourceOfIncome.STUDENT_NO_INCOME:
        break;

      default:
        addError(['source_of_income'], 'Invalid source of income');
    }
  });

/**
 * ✅ This is the NEW schema for the array of incomes
 */
export const sourceOfIncomeArraySchema = z.array(sourceOfIncomeSchema);

/**
 * ✅ Update type to reflect an array
 */
export type SourceOfIncomeDto = z.infer<typeof sourceOfIncomeArraySchema>;
