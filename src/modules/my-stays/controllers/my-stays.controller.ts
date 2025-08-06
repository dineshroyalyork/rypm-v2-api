import { Controller, Post, Get, Put, Delete, Body, Query, Request, UseGuards, UsePipes, Param } from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { MyStaysService } from '../services/my-stays.service';
import { CreateResidentDto, createResidentSchema } from '../dto/create-resident.dto';
import { GetResidentsDto, getResidentsSchema } from '../dto/get-residents.dto';
import { SendRoommateRequestDto, sendRoommateRequestSchema } from '../dto/send-roommate-request.dto';
import { UpdateRoommateRequestDto, updateRoommateRequestSchema } from '../dto/update-roommate-request.dto';
import { GetRoommateRequestsDto, getRoommateRequestsSchema } from '../dto/get-roommate-requests.dto';
import { CreateTenantStayDto, createTenantStaySchema } from '../dto/create-tenant-stay.dto';
import { UpdateTenantStayDto, updateTenantStaySchema } from '../dto/update-tenant-stay.dto';
import { GetTenantStaysDto, getTenantStaysSchema } from '../dto/get-tenant-stays.dto';
import { CustomZodValidationPipe } from '@/shared/pipes/custom-zod-validation.pipe';

@Controller({ path: 'my-stays', version: '2' })
@UseGuards(AuthGuard)
export class MyStaysController {
  constructor(private readonly myStaysService: MyStaysService) {}

  @Post('residents')
  @UsePipes(new CustomZodValidationPipe(createResidentSchema))
  async createResident(@Request() req: any, @Body() createResidentDto: CreateResidentDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.createResident(tenant_id, createResidentDto);
  }

  @Get('residents')
  @UsePipes(new CustomZodValidationPipe(getResidentsSchema))
  async getResidents(@Request() req: any, @Query() query: GetResidentsDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.getResidents(tenant_id, query);
  }

  @Get('residents/:id')
  async getResidentById(@Request() req: any, @Param('id') id: string) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.getResidentById(tenant_id, id);
  }

  // Roommate Request Endpoints
  @Post('roommate-requests')
  @UsePipes(new CustomZodValidationPipe(sendRoommateRequestSchema))
  async sendRoommateRequest(@Request() req: any, @Body() sendRoommateRequestDto: SendRoommateRequestDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.sendRoommateRequest(tenant_id, sendRoommateRequestDto);
  }

  @Get('roommate-requests')
  @UsePipes(new CustomZodValidationPipe(getRoommateRequestsSchema))
  async getRoommateRequests(@Request() req: any, @Query() query: GetRoommateRequestsDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.getRoommateRequests(tenant_id, query);
  }

  @Put('roommate-requests')
  @UsePipes(new CustomZodValidationPipe(updateRoommateRequestSchema))
  async updateRoommateRequest(@Request() req: any, @Body() updateRoommateRequestDto: UpdateRoommateRequestDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.updateRoommateRequest(tenant_id, updateRoommateRequestDto);
  }

  // Tenant Stay Endpoints
  @Post('tenant-stays')
  @UsePipes(new CustomZodValidationPipe(createTenantStaySchema))
  async createTenantStay(@Request() req: any, @Body() createTenantStayDto: CreateTenantStayDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.createTenantStay(tenant_id, createTenantStayDto);
  }

  @Get('tenant-stays')
  @UsePipes(new CustomZodValidationPipe(getTenantStaysSchema))
  async getTenantStays(@Request() req: any, @Query() query: GetTenantStaysDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.getTenantStays(tenant_id, query);
  }

  @Put('tenant-stays')
  @UsePipes(new CustomZodValidationPipe(updateTenantStaySchema))
  async updateTenantStay(@Request() req: any, @Body() updateTenantStayDto: UpdateTenantStayDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.myStaysService.updateTenantStay(tenant_id, updateTenantStayDto);
  }
}
