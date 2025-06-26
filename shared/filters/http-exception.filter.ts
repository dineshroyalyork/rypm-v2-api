import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // ⚠️ ZodValidationException ko skip karo
    if (
      exception instanceof HttpException &&
      exception.getResponse &&
      typeof exception.getResponse === 'function'
    ) {
      const res = exception.getResponse();
      if (typeof res === 'object' && (res as any)?.error === 'ZodValidationException') {
        throw exception; // Let Nest handle Zod errors
      }
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Error';

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      status = exception.getStatus();
      message = res.message || res;
      error = res.error || exception.name;
    }

    response.status(status).json({
      statusCode: status,
      status: false,
      message,
      error,
    });
  }
}
