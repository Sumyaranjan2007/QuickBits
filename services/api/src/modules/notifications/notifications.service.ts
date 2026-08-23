import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../database/entities/notification.entity';
import { NotificationType } from '@quickbite/types';

/**
 * Mock push notification provider for development.
 * Logs push notifications instead of sending them to FCM.
 */
@Injectable()
export class MockPushProvider {
  private readonly logger = new Logger(MockPushProvider.name);

  async send(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    this.logger.log(`[MOCK PUSH] To: ${userId} | ${title}: ${body}`);
  }
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @Inject(MockPushProvider) private readonly pushProvider: MockPushProvider,
  ) {}

  /**
   * Create and persist a notification, then attempt push delivery.
   */
  async send(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, unknown>,
  ) {
    // Persist to database
    const notification = this.notificationRepo.create({
      userId,
      title,
      body,
      type,
      data: data || null,
      isRead: false,
    });
    await this.notificationRepo.save(notification);

    // Attempt push delivery (non-blocking)
    this.pushProvider.send(userId, title, body, data).catch((err) => {
      this.logger.error(`Push notification failed for ${userId}: ${err.message}`);
    });

    return notification;
  }

  async getByUser(userId: string, limit = 50) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepo.count({ where: { userId, isRead: false } });
  }
}
