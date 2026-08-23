import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService, MockPushProvider } from './notifications.service';
import { NotificationEntity } from '../../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService, MockPushProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
