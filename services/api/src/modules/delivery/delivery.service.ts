import { Inject, Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApprovalStatus,
  DeliveryAssignmentStatus,
  OrderStatus,
  NotificationType,
} from '@quickbite/types';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { DeliveryAssignmentEntity } from '../../database/entities/delivery-assignment.entity';
import { DeliveryLocationEntity } from '../../database/entities/delivery-location.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderStatusHistoryEntity } from '../../database/entities/order-status-history.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  RegisterDeliveryPartnerDto,
  UpdateLocationDto,
  ToggleOnlineDto,
  UpdateAssignmentStatusDto,
} from './dto/delivery.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(DeliveryPartnerEntity)
    private readonly partnerRepo: Repository<DeliveryPartnerEntity>,
    @InjectRepository(DeliveryAssignmentEntity)
    private readonly assignmentRepo: Repository<DeliveryAssignmentEntity>,
    @InjectRepository(DeliveryLocationEntity)
    private readonly locationRepo: Repository<DeliveryLocationEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<OrderStatusHistoryEntity>,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
  ) {}

  // ─── Registration ──────────────────────────────────────

  async registerPartner(userId: string, dto: RegisterDeliveryPartnerDto) {
    const existing = await this.partnerRepo.findOne({ where: { userId } });
    if (existing) throw new BadRequestException('Already registered as delivery partner');

    const partner = this.partnerRepo.create({
      userId,
      ...dto,
      approvalStatus: ApprovalStatus.PENDING,
      isOnline: false,
    });
    const saved = await this.partnerRepo.save(partner);
    this.logger.log(`Delivery partner registered: ${saved.id} (pending approval)`);
    return saved;
  }

  async getPartnerProfile(userId: string) {
    const partner = await this.partnerRepo.findOne({
      where: { userId },
      relations: ['user', 'user.profile'],
    });
    if (!partner) throw new NotFoundException('Delivery partner profile not found');
    return partner;
  }

  // ─── Online/Offline ────────────────────────────────────

  async toggleOnline(userId: string, dto: ToggleOnlineDto) {
    const partner = await this.getPartnerByUser(userId);

    if (partner.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new ForbiddenException('Your account is not yet approved');
    }

    partner.isOnline = dto.isOnline;
    return this.partnerRepo.save(partner);
  }

  // ─── Assignments ───────────────────────────────────────

  /**
   * Create a delivery assignment when order is READY_FOR_PICKUP.
   * Finds nearest online, approved partner.
   */
  async createAssignment(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // Find available online partner (simplified — production would use geo-proximity)
    const availablePartner = await this.partnerRepo.findOne({
      where: {
        isOnline: true,
        approvalStatus: ApprovalStatus.APPROVED,
      },
    });

    if (!availablePartner) {
      this.logger.warn(`No available delivery partners for order ${orderId}`);
      return null;
    }

    const assignment = this.assignmentRepo.create({
      orderId,
      deliveryPartnerId: availablePartner.id,
      status: DeliveryAssignmentStatus.PENDING,
      assignedAt: new Date(),
    });
    const saved = await this.assignmentRepo.save(assignment);

    // Notify delivery partner
    await this.notificationsService.send(
      availablePartner.userId,
      'New Delivery Request!',
      `You have a new delivery assignment`,
      NotificationType.DELIVERY_UPDATE,
      { assignmentId: saved.id, orderId },
    );

    this.logger.log(`Delivery assigned: ${saved.id} to partner ${availablePartner.id}`);
    return saved;
  }

  async getPendingAssignments(userId: string) {
    const partner = await this.getPartnerByUser(userId);
    return this.assignmentRepo.find({
      where: { deliveryPartnerId: partner.id, status: DeliveryAssignmentStatus.PENDING },
      relations: ['order', 'order.restaurant', 'order.deliveryAddress'],
    });
  }

  async getActiveAssignment(userId: string) {
    const partner = await this.getPartnerByUser(userId);
    return this.assignmentRepo.findOne({
      where: [
        { deliveryPartnerId: partner.id, status: DeliveryAssignmentStatus.ACCEPTED },
        { deliveryPartnerId: partner.id, status: DeliveryAssignmentStatus.PICKED_UP },
      ],
      relations: ['order', 'order.restaurant', 'order.deliveryAddress', 'order.customer'],
    });
  }

  async updateAssignmentStatus(assignmentId: string, userId: string, dto: UpdateAssignmentStatusDto) {
    const partner = await this.getPartnerByUser(userId);
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId, deliveryPartnerId: partner.id },
      relations: ['order'],
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = dto.status;

    // Map assignment status to order status and update timestamps
    if (dto.status === DeliveryAssignmentStatus.ACCEPTED) {
      await this.updateOrderStatus(assignment.orderId, OrderStatus.ASSIGNED, userId);
    } else if (dto.status === DeliveryAssignmentStatus.PICKED_UP) {
      assignment.pickedUpAt = new Date();
      await this.updateOrderStatus(assignment.orderId, OrderStatus.PICKED_UP, userId);
      // Then immediately set OUT_FOR_DELIVERY
      await this.updateOrderStatus(assignment.orderId, OrderStatus.OUT_FOR_DELIVERY, userId);
    } else if (dto.status === DeliveryAssignmentStatus.DELIVERED) {
      assignment.deliveredAt = new Date();
      await this.updateOrderStatus(assignment.orderId, OrderStatus.DELIVERED, userId);
      // Update partner stats
      partner.totalDeliveries += 1;
      await this.partnerRepo.save(partner);
    } else if (dto.status === DeliveryAssignmentStatus.CANCELLED) {
      // Re-assign or handle cancellation
      this.logger.warn(`Delivery assignment ${assignmentId} cancelled by partner ${partner.id}`);
    }

    return this.assignmentRepo.save(assignment);
  }

  // ─── Location ──────────────────────────────────────────

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const partner = await this.getPartnerByUser(userId);

    let location = await this.locationRepo.findOne({
      where: { deliveryPartnerId: partner.id },
    });

    if (location) {
      location.latitude = dto.latitude;
      location.longitude = dto.longitude;
    } else {
      location = this.locationRepo.create({
        deliveryPartnerId: partner.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
    }

    return this.locationRepo.save(location);
  }

  async getPartnerLocation(partnerId: string) {
    return this.locationRepo.findOne({ where: { deliveryPartnerId: partnerId } });
  }

  // ─── Earnings ──────────────────────────────────────────

  async getEarnings(userId: string) {
    const partner = await this.getPartnerByUser(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const deliveredAssignments = await this.assignmentRepo.find({
      where: { deliveryPartnerId: partner.id, status: DeliveryAssignmentStatus.DELIVERED },
      relations: ['order'],
    });

    const todayDeliveries = deliveredAssignments.filter(
      (a) => a.deliveredAt && a.deliveredAt >= today,
    );
    const weekDeliveries = deliveredAssignments.filter(
      (a) => a.deliveredAt && a.deliveredAt >= weekAgo,
    );

    const calcEarnings = (assignments: DeliveryAssignmentEntity[]) =>
      assignments.reduce((sum, a) => sum + Number(a.order?.deliveryFee || 0), 0);

    return {
      totalDeliveries: partner.totalDeliveries,
      todayEarnings: calcEarnings(todayDeliveries),
      todayDeliveries: todayDeliveries.length,
      weeklyEarnings: calcEarnings(weekDeliveries),
      weeklyDeliveries: weekDeliveries.length,
      totalEarnings: calcEarnings(deliveredAssignments),
    };
  }

  async getDeliveryHistory(userId: string) {
    const partner = await this.getPartnerByUser(userId);
    return this.assignmentRepo.find({
      where: { deliveryPartnerId: partner.id, status: DeliveryAssignmentStatus.DELIVERED },
      relations: ['order', 'order.restaurant'],
      order: { deliveredAt: 'DESC' },
      take: 50,
    });
  }

  // ─── Helpers ───────────────────────────────────────────

  private async getPartnerByUser(userId: string) {
    const partner = await this.partnerRepo.findOne({ where: { userId } });
    if (!partner) throw new NotFoundException('Delivery partner not found');
    return partner;
  }

  private async updateOrderStatus(orderId: string, status: OrderStatus, changedBy: string) {
    await this.orderRepo.update(orderId, { status });
    if (status === OrderStatus.ASSIGNED || status === OrderStatus.DELIVERED) {
      // Set delivery partner ID on order
      const assignment = await this.assignmentRepo.findOne({ where: { orderId } });
      if (assignment) {
        const partner = await this.partnerRepo.findOne({ where: { id: assignment.deliveryPartnerId } });
        if (partner) {
          await this.orderRepo.update(orderId, { deliveryPartnerId: partner.userId });
        }
      }
    }
    await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({ orderId, status, changedBy }),
    );
  }
}
