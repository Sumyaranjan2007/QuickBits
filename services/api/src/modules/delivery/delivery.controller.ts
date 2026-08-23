import { Inject, Controller, Get, Post, Patch,
  Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import {
  RegisterDeliveryPartnerDto,
  UpdateLocationDto,
  ToggleOnlineDto,
  UpdateAssignmentStatusDto,
} from './dto/delivery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Delivery')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(@Inject(DeliveryService) private readonly deliveryService: DeliveryService) {}

  @Post('register')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Register as delivery partner' })
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterDeliveryPartnerDto,
  ): Promise<IApiResponse> {
    const data = await this.deliveryService.registerPartner(userId, dto);
    return { success: true, data, message: 'Registration submitted (pending admin approval)' };
  }

  @Get('profile')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Get delivery partner profile' })
  async getProfile(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.deliveryService.getPartnerProfile(userId);
    return { success: true, data, message: 'Profile retrieved' };
  }

  @Patch('toggle-online')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Toggle online/offline status' })
  async toggleOnline(
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleOnlineDto,
  ): Promise<IApiResponse> {
    const data = await this.deliveryService.toggleOnline(userId, dto);
    return { success: true, data, message: `Status: ${data.isOnline ? 'ONLINE' : 'OFFLINE'}` };
  }

  @Get('assignments/pending')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Get pending delivery requests' })
  async getPendingAssignments(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.deliveryService.getPendingAssignments(userId);
    return { success: true, data, message: 'Pending assignments retrieved' };
  }

  @Get('assignments/active')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Get active delivery' })
  async getActiveAssignment(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.deliveryService.getActiveAssignment(userId);
    return { success: true, data, message: 'Active assignment retrieved' };
  }

  @Patch('assignments/:assignmentId/status')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Update delivery assignment status' })
  async updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAssignmentStatusDto,
  ): Promise<IApiResponse> {
    const data = await this.deliveryService.updateAssignmentStatus(assignmentId, userId, dto);
    return { success: true, data, message: `Assignment status updated to ${dto.status}` };
  }

  @Patch('location')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Update current location' })
  async updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<IApiResponse> {
    const data = await this.deliveryService.updateLocation(userId, dto);
    return { success: true, data, message: 'Location updated' };
  }

  @Get('earnings')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Get earnings summary' })
  async getEarnings(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.deliveryService.getEarnings(userId);
    return { success: true, data, message: 'Earnings retrieved' };
  }

  @Get('history')
  @Roles(UserRole.DELIVERY_PARTNER)
  @ApiOperation({ summary: 'Get delivery history' })
  async getHistory(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.deliveryService.getDeliveryHistory(userId);
    return { success: true, data, message: 'Delivery history retrieved' };
  }
}
