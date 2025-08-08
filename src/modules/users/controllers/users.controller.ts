import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsersService } from '../services/users.service';
import { UserLoginDto, userLoginSchema } from '../dto/user-login.dto';
import { CreateUserDto, createUserSchema } from '../dto/create-user.dto';
import { UpdateUserDto, updateUserSchema } from '../dto/update-user.dto';
import { GetUsersDto, getUsersSchema } from '../dto/get-users.dto';
import { GetManagerAgentsDto, getManagerAgentsSchema } from '../dto/get-manager-agents.dto';
import { ForgotPasswordDto, forgotPasswordSchema } from '../dto/forgot-password.dto';
import { ResetPasswordDto, resetPasswordSchema } from '../dto/reset-password.dto';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { UserGuard } from '../../../shared/guards/user.guard';

@Controller({ path: 'user', version: '2' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Authentication Endpoints
  @Post('login')
  @UsePipes(new ZodValidationPipe(userLoginSchema))
  async login(@Body() loginDto: UserLoginDto) {
    try {
      const result = await this.usersService.login(loginDto);
      return result;
    } catch (error) {
      console.error('User login error:', error);
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
      const result = await this.usersService.forgotPassword(forgotPasswordDto);
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
      const result = await this.usersService.resetPassword(resetPasswordDto);
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

  @UseGuards(UserGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const result = await this.usersService.logout(userId);
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

  @UseGuards(UserGuard)
  @Post('refresh-session')
  async refreshSession(@Req() req: any) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const result = await this.usersService.refreshSession(userId);
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

  // User Management Endpoints (Super Admin only)
  @UseGuards(AdminGuard)
  @Post('create')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    try {
      // Get creator's role from token
      const creatorRole = req.user?.role || 'SUPER_ADMIN';
      const result = await this.usersService.createUser(createUserDto, creatorRole);
      return result;
    } catch (error) {
      console.error('Create user error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to create user',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Get('all')
  @UsePipes(new ZodValidationPipe(getUsersSchema))
  async getAllUsers(@Query() query: GetUsersDto) {
    try {
      const result = await this.usersService.getAllUsers(query);
      return result;
    } catch (error) {
      console.error('Get users error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get users',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      const result = await this.usersService.getUserById(id);
      return result;
    } catch (error) {
      console.error('Get user error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get user',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Put('update')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.usersService.updateUser(updateUserDto);
      return result;
    } catch (error) {
      console.error('Update user error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to update user',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      const result = await this.usersService.deleteUser(id);
      return result;
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to delete user',
        data: null,
      };
    }
  }

  // Manager-specific endpoints
  @Get('manager/agents')
  @UsePipes(new ZodValidationPipe(getManagerAgentsSchema))
  async getManagerAgents(@Query() query: GetManagerAgentsDto) {
    try {
      const result = await this.usersService.getManagerAgents(query.manager_id, query);
      return result;
    } catch (error) {
      console.error('Get manager agents error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get manager agents',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Post('assign-agent')
  async assignAgentToManager(@Body() body: { agent_id: string; manager_id: string }, @Req() req: any) {
    try {
      // Check if the user is SUPER_ADMIN
      const userRole = req.user?.role;
      if (userRole !== 'SUPER_ADMIN') {
        return {
          statusCode: 403,
          success: false,
          message: 'Only SUPER_ADMIN can assign agents to managers',
          data: null,
        };
      }

      const result = await this.usersService.assignAgentToManager(body.agent_id, body.manager_id);
      return result;
    } catch (error) {
      console.error('Assign agent error:', error);
      return {
        statusCode: 400,
        success: false,
        message: error.message || 'Failed to assign agent to manager',
        data: null,
      };
    }
  }

  @UseGuards(AdminGuard)
  @Post('unassign-agent/:agentId')
  async unassignAgentFromManager(@Param('agentId') agentId: string, @Req() req: any) {
    try {
      // Check if the user is SUPER_ADMIN
      const userRole = req.user?.role;
      if (userRole !== 'SUPER_ADMIN') {
        return {
          statusCode: 403,
          success: false,
          message: 'Only SUPER_ADMIN can unassign agents from managers',
          data: null,
        };
      }

      const result = await this.usersService.unassignAgentFromManager(agentId);
      return result;
    } catch (error) {
      console.error('Unassign agent error:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to unassign agent from manager',
        data: null,
      };
    }
  }
} 