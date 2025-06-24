import { z } from "zod";

export const verifyOtpSchema = z
  .object({
    type: z
      .enum(["phone", "email"], {
        required_error: "type is required and must be phone or email",
      })
      .default("phone"),

    country_code: z.string().min(1).optional(),
    phone_number: z.string().min(5).optional(),
    email: z.string().email().optional(),
    otp: z
    .string()
    .length(6, { message: 'OTP must be 6 digits' })
    .regex(/^\d{6}$/, { message: 'OTP must be numeric' }),
  })
  .superRefine((data, ctx) => {
    if (data.type === "phone") {
      if (!data.country_code || !data.phone_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'country_code and phone_number are required for type "phone"',
          path: ["phone_number"],
        });
      }
    } else if (data.type === "email") {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'email is required for type "email"',
          path: ["email"],
        });
      }
    }
  });

  export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
