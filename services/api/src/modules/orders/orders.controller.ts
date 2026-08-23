import { Inject, Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  // ─── Customer ──────────────────────────────────────────

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create order from cart (customer)' })
  async createOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
  ): Promise<IApiResponse> {
    const data = await this.ordersService.createOrder(customerId, dto);
    return { success: true, data, message: 'Order placed successfully' };
  }

  @Get('my-orders')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get my orders (customer)' })
  async getMyOrders(
    @CurrentUser('id') customerId: string,
    @Query() query: OrderQueryDto,
  ): Promise<IApiResponse> {
    const data = await this.ordersService.findByCustomer(customerId, query);
    return { success: true, data, message: 'Orders retrieved' };
  }

  // ─── Restaurant ────────────────────────────────────────

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Get restaurant orders' })
  async getRestaurantOrders(
    @Param('restaurantId') restaurantId: string,
    @Query() query: OrderQueryDto,
  ): Promise<IApiResponse> {
    const data = await this.ordersService.findByRestaurant(restaurantId, query);
    return { success: true, data, message: 'Restaurant orders retrieved' };
  }

  // ─── Common ────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@Param('id') id: string): Promise<IApiResponse> {
    const data = await this.ordersService.findById(id);
    return { success: true, data, message: 'Order retrieved' };
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get order status history' })
  async getStatusHistory(@Param('id') id: string): Promise<IApiResponse> {
    const data = await this.ordersService.getStatusHistory(id);
    return { success: true, data, message: 'Status history retrieved' };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<IApiResponse> {
    const data = await this.ordersService.updateStatus(id, userId, userRole, dto);
    return { success: true, data, message: `Order status updated to ${dto.status}` };
  }
}
