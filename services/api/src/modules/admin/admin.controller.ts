import { Inject, Controller, Get, Patch, Query, Param, Body, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApprovalStatus, OrderStatus, IApiResponse } from '@quickbite/types';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard(): Promise<IApiResponse> {
    const data = await this.adminService.getDashboardStats();
    return { success: true, data, message: 'Dashboard stats retrieved' };
  }

  // ─── Customers ─────────────────────────────────────────

  @Get('customers')
  @ApiOperation({ summary: 'List customers' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getCustomers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<IApiResponse> {
    const data = await this.adminService.getCustomers(page, limit, search);
    return { success: true, data, message: 'Customers retrieved' };
  }

  @Patch('customers/:userId/toggle-block')
  @ApiOperation({ summary: 'Block/unblock customer' })
  async toggleBlock(@Param('userId') userId: string): Promise<IApiResponse> {
    const data = await this.adminService.toggleCustomerBlock(userId);
    return { success: true, data, message: `Customer ${data?.isActive ? 'unblocked' : 'blocked'}` };
  }

  // ─── Restaurants ───────────────────────────────────────

  @Get('restaurants')
  @ApiOperation({ summary: 'List restaurants' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus })
  async getRestaurants(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ApprovalStatus,
  ): Promise<IApiResponse> {
    const data = await this.adminService.getRestaurants(page, limit, status);
    return { success: true, data, message: 'Restaurants retrieved' };
  }

  @Patch('restaurants/:id/approval')
  @ApiOperation({ summary: 'Update restaurant approval status' })
  async updateRestaurantApproval(
    @Param('id') id: string,
    @Body('status') status: ApprovalStatus,
  ): Promise<IApiResponse> {
    const data = await this.adminService.updateRestaurantApproval(id, status);
    return { success: true, data, message: `Restaurant ${status}` };
  }

  @Patch('restaurants/:id/commission')
  @ApiOperation({ summary: 'Update restaurant commission rate' })
  async updateCommission(
    @Param('id') id: string,
    @Body('rate') rate: number,
  ): Promise<IApiResponse> {
    const data = await this.adminService.updateRestaurantCommission(id, rate);
    return { success: true, data, message: 'Commission updated' };
  }

  // ─── Delivery Partners ─────────────────────────────────

  @Get('delivery-partners')
  @ApiOperation({ summary: 'List delivery partners' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus })
  async getDeliveryPartners(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ApprovalStatus,
  ): Promise<IApiResponse> {
    const data = await this.adminService.getDeliveryPartners(page, limit, status);
    return { success: true, data, message: 'Delivery partners retrieved' };
  }

  @Patch('delivery-partners/:id/approval')
  @ApiOperation({ summary: 'Update delivery partner approval' })
  async updatePartnerApproval(
    @Param('id') id: string,
    @Body('status') status: ApprovalStatus,
  ): Promise<IApiResponse> {
    const data = await this.adminService.updateDeliveryPartnerApproval(id, status);
    return { success: true, data, message: `Delivery partner ${status}` };
  }

  // ─── Orders ────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List all orders' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'search', required: false })
  async getOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ): Promise<IApiResponse> {
    const data = await this.adminService.getOrders(page, limit, status, search);
    return { success: true, data, message: 'Orders retrieved' };
  }

  // ─── Reports ───────────────────────────────────────────

  @Get('reports/revenue')
  @ApiOperation({ summary: 'Revenue report' })
  @ApiQuery({ name: 'days', required: false })
  async getRevenueReport(@Query('days') days?: number): Promise<IApiResponse> {
    const data = await this.adminService.getRevenueReport(days);
    return { success: true, data, message: 'Revenue report retrieved' };
  }
}
