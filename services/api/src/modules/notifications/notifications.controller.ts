import { Inject, Controller, Get, Patch,
  Param, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IApiResponse } from '@quickbite/types';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(@Inject(NotificationsService) private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  async getNotifications(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.notificationsService.getByUser(userId);
    return { success: true, data, message: 'Notifications retrieved' };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { success: true, data: { count }, message: 'Unread count retrieved' };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<IApiResponse> {
    const data = await this.notificationsService.markAsRead(id, userId);
    return { success: true, data, message: data.message };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: string): Promise<IApiResponse> {
    const data = await this.notificationsService.markAllAsRead(userId);
    return { success: true, data, message: data.message };
  }
}
