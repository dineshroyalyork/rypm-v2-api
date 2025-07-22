import { z } from 'zod';
import { SourceOfIncome } from '@/shared/enums/account-details.enum';

export const sourceOfIncomeSchema = z
  .object({
    // Source of income type
    source_of_income: z.nativeEnum(SourceOfIncome, {
      required_error: 'Please select your source of income',
    }),

    // Employment details (conditional based on source of income)
    employer: z.string().optional(),
    occupation: z.string().optional(),
    position_title: z.string().optional(),
    start_date: z.string().optional(),
    monthly_income: z.number().positive('Monthly income must be positive').optional(),

    // Manager/Contact details (for employed status)
    manager_name: z.string().optional(),
    manager_phone_number: z.string().optional(),
    manager_email: z.string().email('Please enter a valid email address').optional(),

    // Additional income sources (for government assistance, etc.)
    additional_income_sources: z
      .array(
        z.object({
          source_name: z.string().min(1, 'Source name is required'),
          amount: z.number().positive('Amount must be positive'),
          frequency: z.enum(['monthly', 'yearly', 'one_time']),
        })
      )
      .optional(),
    // Add this field for linking additional income
    additional_income_id: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate conditional fields based on source of income
    switch (data.source_of_income) {
      case SourceOfIncome.EMPLOYED:
        if (!data.employer || !data.occupation || !data.position_title || !data.start_date || !data.monthly_income) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Employer, occupation, position, start date, and monthly income are required for employed status',
            path: ['employer'],
          });
        }
        if (!data.manager_name || !data.manager_phone_number || !data.manager_email) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Manager details are required for employed status',
            path: ['manager_name'],
          });
        }
        break;

      case SourceOfIncome.SELF_EMPLOYED:
        if (!data.occupation || !data.start_date || !data.monthly_income) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Occupation, start date, and monthly income are required for self-employed status',
            path: ['occupation'],
          });
        }
        break;

      case SourceOfIncome.GOVERNMENT_ASSISTANCE:
        if (!data.monthly_income) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Monthly income is required for government assistance status',
            path: ['monthly_income'],
          });
        }
        break;

      case SourceOfIncome.STUDENT_NO_INCOME:
        // No additional validation needed for students with no income
        break;

      case SourceOfIncome.STUDENT_SUPPORTED_BY_PARENTS:
        if (!data.monthly_income) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Monthly support amount is required for students supported by parents',
            path: ['monthly_income'],
          });
        }
        break;

      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid source of income selected',
          path: ['source_of_income'],
        });
    }
  });

export type SourceOfIncomeDto = z.infer<typeof sourceOfIncomeSchema>;
