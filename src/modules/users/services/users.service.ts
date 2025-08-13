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

    // Extract query parameters
    const { role, is_active, search, page_number = 1, page_size = 10 } = query;

    // Build where clause
    const where: any = {
      // Exclude admin users - only show managers and agents
      role: {
        in: ['MANAGER', 'LEASING_AGENT']
      }
    };

    // Add role filter if specified
    if (role && ['MANAGER', 'LEASING_AGENT'].includes(role)) {
      where.role = role;
    }

    // Add active status filter if specified
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    // Add search filter if specified
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (Number(page_number) - 1) * Number(page_size);
    const take = Number(page_size);

    // Get users with pagination
    const users = await this.prisma.users.findMany({
      where,
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
      skip,
      take,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get total count for pagination
    const totalCount = await this.prisma.users.count({ where });

    return {
      statusCode: 200,
      success: true,
      message: 'Managers and agents retrieved successfully',
      data: users,
      pagination: {
        page_number: Number(page_number),
        page_size: Number(page_size),
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / Number(page_size))
      }
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

  // Lead (Tenant) Management Methods
  async getAgentLeads(agentId: string) {

    const leads = await this.prisma.tenants.findMany({
      where: {
        assigned_agent: {
          some: { id: agentId }
        }
      },
      include: {
        personal_informations: true,
        rental_preference: true,
        tour_scheduled: {
          include: {
            property: true
          }
        }
      }
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Agent leads retrieved successfully',
      data: leads,
    };
  }

  async getManagerTeamLeads(managerId: string, currentUser: any) {
    // Only admins can view manager team leads
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view manager team leads');
    }

    // Get all agents under this manager
    const agents = await this.prisma.users.findMany({
      where: { manager_id: managerId },
      select: { id: true }
    });

    const agentIds = agents.map(agent => agent.id);

    // Get leads assigned to any of these agents
    const leads = await this.prisma.tenants.findMany({
      where: {
        assigned_agent: {
          some: {
            id: { in: agentIds }
          }
        }
      },
      include: {
        personal_informations: true,
        rental_preference: true,
        tour_scheduled: {
          include: {
            property: true
          }
        }
      }
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Manager team leads retrieved successfully',
      data: leads,
    };
  }

  async assignLeadToAgent(tenantId: string, agentId: string, currentUser: any) {
    // Only admins can assign leads
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can assign leads');
    }

    // Verify the agent exists and is active
    const agent = await this.prisma.users.findUnique({
      where: { id: agentId, is_active: true }
    });

    if (!agent) {
      throw new BadRequestException('Agent not found or inactive');
    }

    // Verify the tenant exists
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Assign the tenant to the agent
    await this.prisma.users.update({
      where: { id: agentId },
      data: {
        assigned_leads: {
          connect: { id: tenantId }
        }
      }
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Lead assigned to agent successfully',
      data: { tenantId, agentId },
    };
  }

  async unassignLeadFromAgent(tenantId: string, currentUser: any) {
    // Only admins can unassign leads
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can unassign leads');
    }

    // Find all agents who have this tenant assigned
    const agentsWithLead = await this.prisma.users.findMany({
      where: {
        assigned_leads: {
          some: { id: tenantId }
        }
      },
      select: { id: true }
    });

    // Remove the tenant from all agents
    for (const agent of agentsWithLead) {
      await this.prisma.users.update({
        where: { id: agent.id },
        data: {
          assigned_leads: {
            disconnect: { id: tenantId }
          }
        }
      });
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Lead unassigned from all agents successfully',
      data: { tenantId },
    };
  }

  async getMyAssignedLeads(currentUser: any) {
    if (!currentUser || !currentUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    let leads;
    let message;

    if (currentUser.role === 'ADMIN') {
      // Admin sees all leads in the system
      leads = await this.prisma.tenants.findMany({
        include: {
          personal_informations: true,
          rental_preference: true,
          tour_scheduled: {
            include: {
              property: true
            }
          },
          assigned_agent: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              role: true
            }
          }
        }
      });
      message = 'All leads retrieved successfully for admin';
    } else if (currentUser.role === 'MANAGER') {
      // Manager sees leads assigned to agents under them
      const agentsUnderManager = await this.prisma.users.findMany({
        where: { manager_id: currentUser.sub },
        select: { id: true }
      });

      const agentIds = agentsUnderManager.map(agent => agent.id);

      leads = await this.prisma.tenants.findMany({
        where: {
          assigned_agent: {
            some: {
              id: { in: agentIds }
            }
          }
        },
        include: {
          personal_informations: true,
          rental_preference: true,
          tour_scheduled: {
            include: {
              property: true
            }
          },
          assigned_agent: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              role: true
            }
          }
        }
      });
      message = 'Team leads retrieved successfully for manager';
    } else {
      // LEASING_AGENT sees only their own assigned leads
      leads = await this.prisma.tenants.findMany({
        where: {
          assigned_agent: {
            some: { id: currentUser.sub }
          }
        },
        include: {
          personal_informations: true,
          rental_preference: true,
          tour_scheduled: {
            include: {
              property: true
            }
          }
        }
      });
      message = 'Your assigned leads retrieved successfully';
    }

    return {
      statusCode: 200,
      success: true,
      message,
      data: leads,
    };
  }
} 