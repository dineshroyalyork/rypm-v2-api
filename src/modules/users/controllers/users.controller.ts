import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, UsePipes, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LoginDto } from '../dto/login.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginSchema, CreateUserSchema, UpdateUserSchema } from '../dto';
import { AdminGuard } from '../../../shared/guards/admin.guard';

@Controller('v2/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user);
  }

  @Put('profile')
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return this.usersService.updateProfile(updateUserDto, req.user);
  }

  @Post()
  @UseGuards(AdminGuard)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @UseGuards(AdminGuard)
  async findAll(@Req() req: any, @Query() query: any) {
    return this.usersService.findAll(req.user, query);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.usersService.findOne(id, req.user);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.remove(id, req.user);
  }

  @Get('manager/:managerId/agents')
  @UseGuards(AdminGuard)
  async getManagerAgents(@Param('managerId') managerId: string, @Req() req: any) {
    return this.usersService.getManagerAgents(managerId, req.user);
  }

  @Post('agent/:agentId/assign/:managerId')
  @UseGuards(AdminGuard)
  async assignAgentToManager(
    @Param('agentId') agentId: string,
    @Param('managerId') managerId: string,
    @Req() req: any,
  ) {
    return this.usersService.assignAgentToManager(agentId, managerId, req.user);
  }

  @Post('agent/:agentId/unassign')
  @UseGuards(AdminGuard)
  async unassignAgentFromManager(@Param('agentId') agentId: string, @Req() req: any) {
    return this.usersService.unassignAgentFromManager(agentId, req.user);
  }
} 