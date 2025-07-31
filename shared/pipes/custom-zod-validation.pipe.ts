import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class CustomZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      // Extract all error messages
      const errorMessages = error.errors?.map(err => err.message) || ['Validation failed'];

      // If only one error, return just the message
      if (errorMessages.length === 1) {
        throw new BadRequestException({
          statusCode: 400,
          message: errorMessages[0],
        });
      }

      // If multiple errors, return all messages
      throw new BadRequestException({
        statusCode: 400,
        message: errorMessages.join(', '),
      });
    }
  }
}
