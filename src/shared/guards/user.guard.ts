import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    // private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // const token = this.extractTokenFromHeader(request);
    
    // if (!token) {
    //   throw new UnauthorizedException('Token not found');
    // }
    
    // try {
    //   const payload = await this.jwtService.verifyAsync(token);
    //   request.user = payload;
    //   return true;
    // } catch {
    //   throw new UnauthorizedException('Invalid token');
    // }
    
    // Temporarily allow all requests
    request.user = { id: 'mock-user-id', role: 'ADMIN' };
    return true;
  }

  // private extractTokenFromHeader(request: Request): string | undefined {
  //   const [type, token] = request.headers.authorization?.split(' ') ?? [];
  //   return type === 'Bearer' ? token : undefined;
  // }
} 