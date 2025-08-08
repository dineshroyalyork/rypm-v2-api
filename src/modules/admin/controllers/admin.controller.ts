import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AdminService } from '../services/admin.service';
import { AdminLoginDto, adminLoginSchema } from '../dto/admin-login.dto';
import { ForgotPasswordDto, forgotPasswordSchema } from '../dto/forgot-password.dto';
import { ResetPasswordDto, resetPasswordSchema } from '../dto/reset-password.dto';
import { CreateAdminDto, createAdminSchema } from '../dto/create-admin.dto';
import { UpdateAdminDto, updateAdminSchema } from '../dto/update-admin.dto';
import { GetAdminsDto, getAdminsSchema } from '../dto/get-admins.dto';
import { CreateFirstAdminDto, createFirstAdminSchema } from '../dto/create-first-admin.dto';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { Request } from 'express';

@Controller({ path: 'admin', version: '2' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(adminLoginSchema))
  async login(@Body() loginDto: AdminLoginDto) {
    try {
      const result = await this.adminService.login(loginDto);
      return result;
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Login failed',
        data: null,
      };
    }
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const result = await this.adminService.forgotPassword(forgotPasswordDto);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to send verification code',
        data: null,
      };
    }
  }

  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const result = await this.adminService.resetPassword(resetPasswordDto);
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to reset password',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    try {
      const adminId = req.user?.sub || req.user?.id;
      const result = await this.adminService.logout(adminId);
      return result;
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

  @UseGuards(AdminGuard)
  @Post('refresh-session')
  async refreshSession(@Req() req: any) {
    try {
      const adminId = req.user?.sub || req.user?.id;
      const result = await this.adminService.refreshSession(adminId);
      return result;
    } catch (error) {
      console.error('Refresh session error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to refresh session',
        data: null,
      };
    }
  }

  // Public endpoint to create the first super admin (no authentication required)
  @Post('create-first')
  @UsePipes(new ZodValidationPipe(createFirstAdminSchema))
  async createFirstAdmin(@Body() createFirstAdminDto: CreateFirstAdminDto) {
    try {
      const result = await this.adminService.createFirstAdmin(createFirstAdminDto);
      return result;
    } catch (error) {
      console.error('Create first super admin error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to create first super admin',
        data: null,
      };
    }
  }

  // Super Admin Management Endpoints
  @UseGuards(AdminGuard)
  @Post('create')
  @UsePipes(new ZodValidationPipe(createAdminSchema))
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    try {
      const result = await this.adminService.createAdmin(createAdminDto);
      return result;
    } catch (error) {
      console.error('Create super admin error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to create super admin',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Get('all')
  @UsePipes(new ZodValidationPipe(getAdminsSchema))
  async getAllAdmins(@Query() query: GetAdminsDto) {
    try {
      const result = await this.adminService.getAllAdmins(query);
      return result;
    } catch (error) {
      console.error('Get super admins error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get super admins',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    try {
      const result = await this.adminService.getAdminById(id);
      return result;
    } catch (error) {
      console.error('Get super admin error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get super admin',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Put('update')
  @UsePipes(new ZodValidationPipe(updateAdminSchema))
  async updateAdmin(@Body() updateAdminDto: UpdateAdminDto) {
    try {
      const result = await this.adminService.updateAdmin(updateAdminDto);
      return result;
    } catch (error) {
      console.error('Update super admin error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to update super admin',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteAdmin(id);
      return result;
    } catch (error) {
      console.error('Delete super admin error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to delete super admin',
        data: null,
      };
    }
  }
} 