// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { jwtConstants } from './constants';
// import { Request } from 'express';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private jwtService: JwtService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);
//     if (!token) {
//       throw new UnauthorizedException();
//     }
//     try {
//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: jwtConstants.secret,
//       });
//       // 💡 We're assigning the payload to the request object here
//       // so that we can access it in our route handlers
//       request['user'] = payload;
//     } catch {
//       throw new UnauthorizedException();
//     }
//     return true;
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }

import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators'; // adjust the import path as necessary
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const skipJwtAuth = this.reflector.get<boolean>('skipJwtAuth', context.getHandler());
    if (skipJwtAuth) {
      return true; // Skip JWT validation for this route
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest();

    if (isPublic) {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader) {
          const [token] = authHeader.split(' ');
          const decoded = this.jwtService.verify(token, {
            secret: 'ACCESS_TOKEN_SECRET',
          });
          request.headers.authUserId = decoded.authUserId;
          request.headers.role = decoded.role;
          request.headers.name = decoded.name;
        }
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
      }
      return true;
    }
    return this.validateRequest(request);
  }

  private async validateRequest(request: any): Promise<boolean> {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      this.logger.error('Bearer token is not provided');
      throw new UnauthorizedException('Unauthorized Request');
    }

    const [bearer, token] = authHeader.split(' ');
    if (!bearer || bearer.toLowerCase() !== 'bearer' || !token) {
      this.logger.error('Invalid authorization header format');
      throw new UnauthorizedException('Unauthorized Request');
    }

    const { authUserId, role, name } = this.decodeToken(token);
    //Adding user details to token
    request.headers.authUserId = authUserId;
    request.headers.role = role;
    request.headers.name = name;

    return true;

    // const endpoint = request.route.path;
    // const method = request.method;

    // return this.hasPermission(
    //   roleId?.name,
    //   roleId?._id,
    //   endpoint,
    //   method,
    //   companyId,
    // );
  }

  private decodeToken(token: string): any {
    try {
      return this.jwtService.verify(token, { secret: 'ACCESS_TOKEN_SECRET' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        this.logger.error('Token has expired');
        throw new UnauthorizedException('Token has expired');
      } else {
        this.logger.error(`Authorization error: ${error.message}`);
        throw new UnauthorizedException('Unauthorized Request');
      }
    }
  }
}
