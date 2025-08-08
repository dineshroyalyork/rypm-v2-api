import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RoleHierarchy } from '../../../shared/utils/role-hierarchy';
import { UserLoginDto } from '../dto/user-login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GetUsersDto } from '../dto/get-users.dto';
import { GetManagerAgentsDto } from '../dto/get-manager-agents.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: UserLoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new BadRequestException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    // Generate JWT token with 60-minute expiry
    const access_token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'user',
      },
      { expiresIn: '60m' }
    );

    return {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          phone_number: user.phone_number,
        },
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email');
    }

    if (!user.is_active) {
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

    // Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.is_active) {
      throw new BadRequestException('Account is deactivated');
    }

    // TODO: Verify the verification code from database
    // For now, we'll use a simple approach
    console.log(`Expected verification code for ${email}: ${verification_code}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await this.prisma.users.update({
      where: { id: user.id },
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

  async logout(userId: string) {
    try {
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

  async refreshSession(userId: string) {
    try {
      // Check if user exists and is active
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid session');
      }

      // Generate new token
      const access_token = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          type: 'user',
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

  // User Management Methods
  async createUser(createUserDto: CreateUserDto, creatorRole?: string) {
    try {
      const { email, password, first_name, last_name, role, phone_number, country_code, is_active,manager_id } = createUserDto;

      // Check hierarchy if creator role is provided
      if (creatorRole && !RoleHierarchy.canCreateRole(creatorRole, role)) {
        return {
          statusCode: 403,
          success: false,
          message: `You cannot create users with role '${role}'. You can only create: ${RoleHierarchy.getCreatableRoles(creatorRole).join(', ')}`,
          data: null,
        };
      }

      // Check if user already exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          statusCode: 400,
          success: false,
          message: 'User with this email already exists',
          data: null,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.prisma.users.create({
        data: {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          role,
          phone_number,
          country_code,
          is_active,
          manager_id,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          phone_number: true,
          country_code: true,
          is_active: true,
          created_at: true,
          manager_id: true
        },
      });

      return {
        statusCode: 201,
        success: true,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to create user',
        data: null,
      };
    }
  }

  async getAllUsers(query: GetUsersDto) {
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

      // Get users with pagination
      const [users, total] = await Promise.all([
        this.prisma.users.findMany({
          where,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            phone_number: true,
            country_code: true,
            is_active: true,
            manager_id: true,
            created_at: true,
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.users.count({ where }),
      ]);

      // Get manager details for agents
      const usersWithManagers = await Promise.all(
        users.map(async (user) => {
          if (user.role === 'AGENT' && user.manager_id) {
            const manager = await this.prisma.users.findUnique({
              where: { id: user.manager_id },
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
              }
            });
            return {
              ...user,
              manager_details: manager
            };
          }
          return {
            ...user,
            manager_details: null
          };
        })
      );

      return {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: usersWithManagers,
          pagination: {
            page_number: page,
            page_size: limit,
            total,
            total_pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get users',
        data: null,
      };
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          phone_number: true,
          country_code: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) {
        return {
          statusCode: 404,
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      return {
        statusCode: 200,
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get user',
        data: null,
      };
    }
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    try {
      const { id, email, first_name, last_name, role, phone_number, country_code, is_active } = updateUserDto;

      // Check if user exists
      const existingUser = await this.prisma.users.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return {
          statusCode: 404,
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.email) {
        const emailExists = await this.prisma.users.findUnique({
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

      // Update user
      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: {
          email,
          first_name,
          last_name,
          role,
          phone_number,
          country_code,
          is_active,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          phone_number: true,
          country_code: true,
          is_active: true,
          updated_at: true,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to update user',
        data: null,
      };
    }
  }

  async deleteUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await this.prisma.users.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return {
          statusCode: 404,
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      // Delete user
      await this.prisma.users.delete({
        where: { id },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to delete user',
        data: null,
      };
    }
  }

  // Manager-specific methods
  async getManagerAgents(managerId: string, query: GetManagerAgentsDto) {
    try {
      const { page_number, page_size, is_active, search } = query;
      const page = parseInt(page_number);
      const limit = parseInt(page_size);
      const skip = (page - 1) * limit;

      // Build where clause for agents under this manager
      const where: any = {
        manager_id: managerId,
        role: 'AGENT',
      };
      
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

      // Get agents with pagination
      const [agents, total] = await Promise.all([
        this.prisma.users.findMany({
          where,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            phone_number: true,
            country_code: true,
            is_active: true,
            created_at: true,
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.users.count({ where }),
      ]);

      return {
        statusCode: 200,
        success: true,
        message: 'Manager agents retrieved successfully',
        data: {
          agents,
          pagination: {
            page_number: page,
            page_size: limit,
            total,
            total_pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Error getting manager agents:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to get manager agents',
        data: null,
      };
    }
  }

  async assignAgentToManager(agentId: string, managerId: string) {
    try {
      // Check if agent exists
      const agent = await this.prisma.users.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        return {
          statusCode: 404,
          success: false,
          message: 'Agent not found',
          data: null,
        };
      }

      if (agent.role !== 'AGENT') {
        return {
          statusCode: 400,
          success: false,
          message: 'User is not an agent',
          data: null,
        };
      }

      // Check if manager exists
      const manager = await this.prisma.users.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return {
          statusCode: 404,
          success: false,
          message: 'Manager not found',
          data: null,
        };
      }

      if (manager.role !== 'MANAGER') {
        return {
          statusCode: 400,
          success: false,
          message: 'User is not a manager',
          data: null,
        };
      }

      // Check if agent is already assigned to a manager
      if (agent.manager_id) {
        return {
          statusCode: 400,
          success: false,
          message: 'Agent is already assigned to a manager',
          data: null,
        };
      }

      // Assign agent to manager
      const updatedAgent = await this.prisma.users.update({
        where: { id: agentId },
        data: {
          manager_id: managerId,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          manager_id: true,
          updated_at: true,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Agent assigned to manager successfully',
        data: updatedAgent,
      };
    } catch (error) {
      console.error('Error assigning agent to manager:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to assign agent to manager',
        data: null,
      };
    }
  }

  async unassignAgentFromManager(agentId: string) {
    try {
      // Check if agent exists
      const agent = await this.prisma.users.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        return {
          statusCode: 404,
          success: false,
          message: 'Agent not found',
          data: null,
        };
      }

      // Remove manager assignment
      const updatedAgent = await this.prisma.users.update({
        where: { id: agentId },
        data: {
          manager_id: null,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          manager_id: true,
          updated_at: true,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Agent unassigned from manager successfully',
        data: updatedAgent,
      };
    } catch (error) {
      console.error('Error unassigning agent from manager:', error);
      return {
        statusCode: 500,
        success: false,
        message: 'Failed to unassign agent from manager',
        data: null,
      };
    }
  }

} 