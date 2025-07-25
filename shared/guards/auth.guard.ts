import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { WinstonLoggerService } from '../logger/winston-logger.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private logger: WinstonLoggerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, //jwtConstants.secret,
      });
      console.log('payload', payload);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        this.logger.warn('Token has expired');
        // throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        this.logger.warn('Invalid token');
        // throw new UnauthorizedException('Invalid token');
      }
      // Handle other JWT errors or rethrow the error
      this.logger.error('Error verifying token', error.stack);
      // throw new UnauthorizedException('Unauthorized');

      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
