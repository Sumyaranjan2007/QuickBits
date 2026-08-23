import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { CouponEntity } from '../../database/entities/coupon.entity';
import {
  UserRole,
  ApprovalStatus,
  OrderStatus,
  PaymentStatus,
} from '@quickbite/types';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@quickbite/config';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(DeliveryPartnerEntity)
    private readonly deliveryPartnerRepo: Repository<DeliveryPartnerEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  // ─── Dashboard ─────────────────────────────────────────

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomers,
      activeRestaurants,
      totalDeliveryPartners,
      totalOrders,
      todayOrders,
      pendingRestaurants,
      pendingDeliveryPartners,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.restaurantRepo.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
      this.deliveryPartnerRepo.count(),
      this.orderRepo.count(),
      this.orderRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.restaurantRepo.count({ where: { approvalStatus: ApprovalStatus.PENDING } }),
      this.deliveryPartnerRepo.count({ where: { approvalStatus: ApprovalStatus.PENDING } }),
    ]);

    // GMV and Revenue from successful payments
    const revenueResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'gmv')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne();

    const todayRevenueResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'revenue')
      .innerJoin('p.order', 'o')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('o.created_at BETWEEN :start AND :end', { start: today, end: tomorrow })
      .getRawOne();

    const activeDeliveries = await this.orderRepo.count({
      where: [
        { status: OrderStatus.ASSIGNED },
        { status: OrderStatus.PICKED_UP },
        { status: OrderStatus.OUT_FOR_DELIVERY },
      ],
    });

    return {
      totalCustomers,
      activeRestaurants,
      totalDeliveryPartners,
      totalOrders,
      todayOrders,
      gmv: parseFloat(revenueResult?.gmv) || 0,
      todayRevenue: parseFloat(todayRevenueResult?.revenue) || 0,
      pendingRestaurants,
      pendingDeliveryPartners,
      activeDeliveries,
    };
  }

  // ─── Customer Management ───────────────────────────────

  async getCustomers(page = 1, limit = DEFAULT_PAGE_SIZE, search?: string) {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const qb = this.userRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.profile', 'p')
      .where('u.role = :role', { role: UserRole.CUSTOMER });

    if (search) {
      qb.andWhere('(u.email LIKE :s OR u.phone LIKE :s OR p.firstName LIKE :s OR p.lastName LIKE :s)', { s: `%${search}%` });
    }

    const [items, total] = await qb
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleCustomerBlock(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId, role: UserRole.CUSTOMER } });
    if (!user) return null;
    user.isActive = !user.isActive;
    this.logger.log(`Customer ${userId} ${user.isActive ? 'unblocked' : 'blocked'}`);
    return this.userRepo.save(user);
  }

  // ─── Restaurant Management ─────────────────────────────

  async getRestaurants(page = 1, limit = DEFAULT_PAGE_SIZE, status?: ApprovalStatus) {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const where: Record<string, unknown> = {};
    if (status) where.approvalStatus = status;

    const [items, total] = await this.restaurantRepo.findAndCount({
      where,
      relations: ['owner', 'owner.profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateRestaurantApproval(id: string, status: ApprovalStatus) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) return null;
    restaurant.approvalStatus = status;
    if (status === ApprovalStatus.SUSPENDED) restaurant.isActive = false;
    if (status === ApprovalStatus.APPROVED) restaurant.isActive = true;
    this.logger.log(`Restaurant ${id} approval: ${status}`);
    return this.restaurantRepo.save(restaurant);
  }

  async updateRestaurantCommission(id: string, rate: number) {
    await this.restaurantRepo.update(id, { commissionRate: rate });
    return this.restaurantRepo.findOne({ where: { id } });
  }

  // ─── Delivery Partner Management ───────────────────────

  async getDeliveryPartners(page = 1, limit = DEFAULT_PAGE_SIZE, status?: ApprovalStatus) {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const where: Record<string, unknown> = {};
    if (status) where.approvalStatus = status;

    const [items, total] = await this.deliveryPartnerRepo.findAndCount({
      where,
      relations: ['user', 'user.profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateDeliveryPartnerApproval(id: string, status: ApprovalStatus) {
    const partner = await this.deliveryPartnerRepo.findOne({ where: { id } });
    if (!partner) return null;
    partner.approvalStatus = status;
    this.logger.log(`Delivery partner ${id} approval: ${status}`);
    return this.deliveryPartnerRepo.save(partner);
  }

  // ─── Order Management ──────────────────────────────────

  async getOrders(page = 1, limit = DEFAULT_PAGE_SIZE, status?: OrderStatus, search?: string) {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.restaurant', 'r')
      .leftJoinAndSelect('o.items', 'items');

    if (status) qb.andWhere('o.status = :status', { status });
    if (search) qb.andWhere('o.id LIKE :search', { search: `%${search}%` });

    const [items, total] = await qb
      .orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Reports ───────────────────────────────────────────

  async getRevenueReport(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.created_at)', 'date')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('SUM(o.total)', 'revenue')
      .addSelect('SUM(o.subtotal)', 'gmv')
      .where('o.created_at >= :startDate', { startDate })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('DATE(o.created_at)')
      .orderBy('DATE(o.created_at)', 'ASC')
      .getRawMany();

    return result;
  }
}
