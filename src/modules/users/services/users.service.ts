import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LoginDto } from '../dto/login.dto';
// import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.users.findUnique({
      where: { email },
      include: {
        profile: true,
        permissions: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Temporarily return mock token until JWT is set up
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'user',
    };

    const token = this.jwtService.sign(payload);

    return {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          team: user.team,
          manager: user.manager,
          permissions: user.permissions,
        },
      },
    };
  }

  async getProfile(currentUser: any) {
    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: currentUser.id },
      include: {
        profile: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
        agents: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  async updateProfile(updateUserDto: UpdateUserDto, currentUser: any) {
    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Users can only update their own profile, not role or manager
    const { role, manager_id, ...safeUpdateData } = updateUserDto;

    const user = await this.prisma.users.update({
      where: { id: currentUser.id },
      data: safeUpdateData,
      include: {
        profile: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  async create(createUserDto: CreateUserDto, currentUser: any) {
    // Only admins can create users
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create users');
    }

    // Check if current user can create this role
    if (!this.canCreateRole(currentUser.role, createUserDto.role)) {
      throw new ForbiddenException('You cannot create users with this role');
    }

    // Check if email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        profile: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  async findAll(currentUser: any, query: any = {}) {
    // Only admins can see all users
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all users');
    }

    const users = await this.prisma.users.findMany({
      include: {
        profile: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
        agents: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  async findOne(id: string, currentUser: any) {
    // Only admins can view other users
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view other users');
    }

    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        profile: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
        agents: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      statusCode: 200,
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    // Only admins can update other users
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update other users');
    }

    // Check if trying to change role
    if (updateUserDto.role && updateUserDto.role !== currentUser.role) {
      if (!this.canCreateRole(currentUser.role, updateUserDto.role)) {
        throw new ForbiddenException('You cannot assign this role');
      }
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: updateUserDto,
      include: {
        profile: true,
        team: true,
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  async remove(id: string, currentUser: any) {
    // Only admins can delete users
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete users');
    }

    // Prevent self-deletion
    if (id === currentUser.id) {
      throw new BadRequestException('Cannot delete yourself');
    }

    await this.prisma.users.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'User deleted successfully',
      data: null,
    };
  }

  async getManagerAgents(managerId: string, currentUser: any) {
    // Only admins can view manager agents
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view manager agents');
    }

    const agents = await this.prisma.users.findMany({
      where: { manager_id: managerId },
      include: {
        profile: true,
        team: true,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Manager agents retrieved successfully',
      data: agents,
    };
  }

  async assignAgentToManager(agentId: string, managerId: string, currentUser: any) {
    // Only admins can assign agents
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can assign agents');
    }

    const user = await this.prisma.users.update({
      where: { id: agentId },
      data: { manager_id: managerId },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Agent assigned to manager successfully',
      data: user,
    };
  }

  async unassignAgentFromManager(agentId: string, currentUser: any) {
    // Only admins can unassign agents
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can unassign agents');
    }

    const user = await this.prisma.users.update({
      where: { id: agentId },
      data: { manager_id: null },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Agent unassigned from manager successfully',
      data: user,
    };
  }

  private canCreateRole(currentUserRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      ADMIN: ['ADMIN', 'MANAGER', 'LEASING_AGENT'],
      MANAGER: ['LEASING_AGENT'],
      LEASING_AGENT: [],
    };

    return roleHierarchy[currentUserRole]?.includes(targetRole) || false;
  }

  private async canAccessUser(currentUser: any, targetUserId: string): Promise<boolean> {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.id === targetUserId) return true;
    if (currentUser.role === 'MANAGER') {
      // Managers can access their agents
      const agent = await this.prisma.users.findFirst({
        where: { id: targetUserId, manager_id: currentUser.id },
      });
      return !!agent;
    }
    return false;
  }
} 