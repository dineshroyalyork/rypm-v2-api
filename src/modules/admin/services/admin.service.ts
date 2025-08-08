import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { GetAdminsDto } from '../dto/get-admins.dto';
import { CreateFirstAdminDto } from '../dto/create-first-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: AdminLoginDto) {
    const { email, password } = loginDto;

    // Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!admin.is_active) {
      throw new BadRequestException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    // Generate JWT token with 60-minute expiry
    const access_token = this.jwtService.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin',
      },
      { expiresIn: '60m' }
    );

    // Update last login and session timeout
    const sessionTimeout = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        last_login: new Date(),
        session_timeout: sessionTimeout,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: {
        access_token,
        admin: {
          id: admin.id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: admin.role,
        },
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found with this email');
    }

    if (!admin.is_active) {
      throw new BadRequestException('Account is deactivated');
    }

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in database (you might want to create a separate table for this)
    // For now, we'll use a simple approach - in production, use a proper verification system
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // TODO: Send email with verification code
    // await this.emailService.sendVerificationCode(email, verificationCode);

    return {
      statusCode: 200,
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email,
        // Remove verification code in production
        verification_code: verificationCode, // Only for development
      },
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, verification_code, new_password } = resetPasswordDto;

    // Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    if (!admin.is_active) {
      throw new BadRequestException('Account is deactivated');
    }

    // TODO: Verify the verification code from database
    // For now, we'll use a simple approach
    console.log(`Expected verification code for ${email}: ${verification_code}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Password reset successfully',
      data: null,
    };
  }

  async logout(adminId: string) {
    try {
      // Clear session timeout
      await this.prisma.admin.update({
        where: { id: adminId },
        data: {
          session_timeout: null,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Logged out successfully',
        data: null,
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to logout',
        data: null,
      };
    }
  }

  async refreshSession(adminId: string) {
    try {
      // Check if admin exists and is active
      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin || !admin.is_active) {
        throw new UnauthorizedException('Invalid session');
      }

      // Update session timeout
      const sessionTimeout = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
      await this.prisma.admin.update({
        where: { id: adminId },
        data: {
          session_timeout: sessionTimeout,
        },
      });

      // Generate new token
      const access_token = this.jwtService.sign(
        {
          sub: admin.id,
          email: admin.email,
          role: admin.role,
          type: 'admin',
        },
        { expiresIn: '60m' }
      );

      return {
        statusCode: 200,
        success: true,
        message: 'Session refreshed successfully',
        data: {
          access_token,
        },
      };
    } catch (error) {
      console.error('Refresh session error:', error);
      return {
        statusCode: 401,
        success: false,
        message: 'Failed to refresh session',
        data: null,
      };
    }
  }

  // Admin Management Methods
  async createFirstAdmin(createFirstAdminDto: CreateFirstAdminDto) {
    try {
      const { email, password, first_name, last_name, role, is_active, security_key } = createFirstAdminDto;

      // Verify security key (you should set this in environment variables)
      const expectedSecurityKey = process.env.ADMIN_CREATION_KEY || 'RYPM_SUPER_ADMIN_2024';
      if (security_key !== expectedSecurityKey) {
        return {
          statusCode: 403,
          success: false,
          message: 'Invalid security key',
          data: null,
        };
      }

      // Check if any super admin already exists
      const existingSuperAdmin = await this.prisma.admin.findFirst();
      if (existingSuperAdmin) {
        return {
          statusCode: 400,
          success: false,
          message: 'Super admin already exists. Use regular super admin creation endpoint.',
          data: null,
        };
      }

      // Check if admin with this email already exists
      const existingAdminByEmail = await this.prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdminByEmail) {
        return {
          statusCode: 400,
          success: false,
          message: 'Admin with this email already exists',
          data: null,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create first admin
      const admin = await this.prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          role,
          is_active,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });

      return {
        statusCode: 201,
        success: true,
        message: 'First admin created successfully',
        data: admin,
      };
    } catch (error) {
      console.error('Error creating first admin:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to create first admin',
        data: null,
      };
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    try {
      const { email, password, first_name, last_name, role, is_active } = createAdminDto;

      // Check if super admin already exists
      const existingSuperAdmin = await this.prisma.admin.findUnique({
        where: { email },
      });

      if (existingSuperAdmin) {
        return {
          statusCode: 400,
          success: false,
          message: 'Super admin with this email already exists',
          data: null,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create super admin
      const superAdmin = await this.prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          role,
          is_active,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });

      return {
        statusCode: 201,
        success: true,
        message: 'Super admin created successfully',
        data: superAdmin,
      };
    } catch (error) {
      console.error('Error creating super admin:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to create super admin',
        data: null,
      };
    }
  }

  async getAllAdmins(query: GetAdminsDto) {
    try {
      const { page_number, page_size, role, is_active, search } = query;
      const page = parseInt(page_number);
      const limit = parseInt(page_size);
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (role) {
        where.role = role;
      }
      
      if (is_active !== undefined) {
        where.is_active = is_active === 'true';
      }
      
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get admins with pagination
      const [admins, total] = await Promise.all([
        this.prisma.admin.findMany({
          where,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.admin.count({ where }),
      ]);

      return {
        statusCode: 200,
        success: true,
        message: 'Super admins retrieved successfully',
        data: {
          superAdmins: admins,
          pagination: {
            page_number: page,
            page_size: limit,
            total,
            total_pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Error getting super admins:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get super admins',
        data: null,
      };
    }
  }

  async getAdminById(id: string) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          last_login: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!admin) {
        return {
          statusCode: 404,
          success: false,
          message: 'Super admin not found',
          data: null,
        };
      }

      return {
        statusCode: 200,
        success: true,
        message: 'Super admin retrieved successfully',
        data: admin,
      };
    } catch (error) {
      console.error('Error getting super admin:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get super admin',
        data: null,
      };
    }
  }

  async updateAdmin(updateAdminDto: UpdateAdminDto) {
    try {
      const { id, email, first_name, last_name, role, is_active } = updateAdminDto;

      // Check if super admin exists
      const existingSuperAdmin = await this.prisma.admin.findUnique({
        where: { id },
      });

      if (!existingSuperAdmin) {
        return {
          statusCode: 404,
          success: false,
          message: 'Super admin not found',
          data: null,
        };
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingSuperAdmin.email) {
        const emailExists = await this.prisma.admin.findUnique({
          where: { email },
        });

        if (emailExists) {
          return {
            statusCode: 400,
            success: false,
            message: 'Email is already taken',
            data: null,
          };
        }
      }

      // Update super admin
      const updatedSuperAdmin = await this.prisma.admin.update({
        where: { id },
        data: {
          email,
          first_name,
          last_name,
          role,
          is_active,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          updated_at: true,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Super admin updated successfully',
        data: updatedSuperAdmin,
      };
    } catch (error) {
      console.error('Error updating super admin:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to update super admin',
        data: null,
      };
    }
  }

  async deleteAdmin(id: string) {
    try {
      // Check if super admin exists
      const existingSuperAdmin = await this.prisma.admin.findUnique({
        where: { id },
      });

      if (!existingSuperAdmin) {
        return {
          statusCode: 404,
          success: false,
          message: 'Super admin not found',
          data: null,
        };
      }

      // Delete super admin
      await this.prisma.admin.delete({
        where: { id },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Super admin deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error deleting super admin:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to delete super admin',
        data: null,
      };
    }
  }
} 