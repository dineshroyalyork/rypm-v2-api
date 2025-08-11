import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    // For now, set a mock admin user for testing
    // In production, this would verify JWT tokens
    req.user = {
      id: 'mock-admin-id',
      role: 'ADMIN',
      email: 'admin@rypm.com'
    };
    
    next();
  }
} 