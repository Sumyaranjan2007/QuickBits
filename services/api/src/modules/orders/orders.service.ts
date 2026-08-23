import { Inject, Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderStatus,
  PaymentMethod,
  UserRole,
  ORDER_STATUS_TRANSITIONS,
  NotificationType,
} from '@quickbite/types';
import {
  PLATFORM_FEE_PERCENTAGE,
  TAX_RATE,
  DEFAULT_DELIVERY_FEE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@quickbite/config';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { OrderStatusHistoryEntity } from '../../database/entities/order-status-history.entity';
import { CartEntity } from '../../database/entities/cart.entity';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { MenuItemEntity } from '../../database/entities/menu-item.entity';
import { MenuItemAddonEntity } from '../../database/entities/menu-item-addon.entity';
import { AddressEntity } from '../../database/entities/address.entity';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { CouponEntity } from '../../database/entities/coupon.entity';
import { CouponUsageEntity } from '../../database/entities/coupon-usage.entity';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<OrderStatusHistoryEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(MenuItemAddonEntity)
    private readonly addonRepo: Repository<MenuItemAddonEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @Inject(PaymentsService) private readonly paymentsService: PaymentsService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(CouponsService) private readonly couponsService: CouponsService,
  ) {}

  /**
   * Create order from the customer's current cart.
   * All totals are computed server-side — never trust client amounts.
   */
  async createOrder(customerId: string, dto: CreateOrderDto) {
    // 1. Validate cart exists and has items
    const cart = await this.cartRepo.findOne({
      where: { customerId },
      relations: ['items', 'items.menuItem', 'items.menuItem.addons', 'restaurant'],
    });
    if (!cart || !cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Validate restaurant is active
    const restaurant = cart.restaurant;
    if (!restaurant.isActive) {
      throw new BadRequestException('Restaurant is currently unavailable');
    }

    // 3. Validate delivery address belongs to customer
    const address = await this.addressRepo.findOne({
      where: { id: dto.deliveryAddressId, userId: customerId },
    });
    if (!address) {
      throw new NotFoundException('Delivery address not found');
    }

    // 4. Calculate order totals server-side
    let subtotal = 0;
    const orderItems: Partial<OrderItemEntity>[] = [];

    for (const cartItem of cart.items) {
      const menuItem = cartItem.menuItem;
      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is no longer available`);
      }

      let itemPrice = Number(menuItem.price);

      // Resolve addon prices
      const resolvedAddons: { id: string; name: string; price: number }[] = [];
      if (cartItem.addons && cartItem.addons.length > 0) {
        const addons = await this.addonRepo.findByIds(cartItem.addons);
        for (const addon of addons) {
          itemPrice += Number(addon.price);
          resolvedAddons.push({ id: addon.id, name: addon.name, price: Number(addon.price) });
        }
      }

      const itemSubtotal = itemPrice * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity: cartItem.quantity,
        addons: resolvedAddons,
        subtotal: itemSubtotal,
      });
    }

    // 5. Check minimum order amount
    if (subtotal < Number(restaurant.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount is ₹${restaurant.minOrderAmount}`,
      );
    }

    // 6. Calculate fees
    const deliveryFee = Number(restaurant.deliveryFee) || DEFAULT_DELIVERY_FEE;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENTAGE / 100);
    const tax = Math.round(subtotal * TAX_RATE / 100);

    // 7. Apply coupon if provided
    let discount = 0;
    let couponId: string | null = null;
    if (dto.couponCode) {
      const couponResult = await this.couponsService.validate(customerId, {
        code: dto.couponCode,
        orderAmount: subtotal,
      });
      discount = couponResult.discount;
      couponId = couponResult.coupon.id;
    }

    const total = subtotal + deliveryFee + platformFee + tax - discount;

    // 8. Create order
    const order = this.orderRepo.create({
      customerId,
      restaurantId: cart.restaurantId,
      deliveryAddressId: dto.deliveryAddressId,
      status: OrderStatus.PENDING,
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      discount,
      couponId,
      total,
      specialInstructions: dto.specialInstructions || null,
      paymentMethod: dto.paymentMethod,
    });
    const savedOrder = await this.orderRepo.save(order);

    // 9. Create order items
    for (const item of orderItems) {
      await this.orderItemRepo.save(
        this.orderItemRepo.create({ ...item, orderId: savedOrder.id }),
      );
    }

    // 10. Record initial status history
    await this.recordStatusHistory(savedOrder.id, OrderStatus.PENDING, customerId, 'Order placed');

    // 11. Record coupon usage
    if (couponId) {
      await this.couponsService.recordUsage(couponId, customerId, savedOrder.id, discount);
    }

    // 12. Create payment
    const paymentResult = await this.paymentsService.createPayment(
      savedOrder.id,
      total,
      dto.paymentMethod,
    );

    // 13. Clear cart
    await this.cartItemRepo.delete({ cartId: cart.id });
    await this.cartRepo.remove(cart);

    // 14. Send notification to restaurant
    await this.notificationsService.send(
      restaurant.ownerId,
      'New Order!',
      `You have a new order #${savedOrder.id.slice(0, 8)}`,
      NotificationType.ORDER_UPDATE,
      { orderId: savedOrder.id },
    );

    this.logger.log(`Order created: ${savedOrder.id} by customer ${customerId}`);

    return {
      order: savedOrder,
      payment: paymentResult,
    };
  }

  /**
   * Update order status with state-machine validation.
   * Only valid transitions are allowed per ORDER_STATUS_TRANSITIONS.
   */
  async updateStatus(orderId: string, userId: string, userRole: UserRole, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['restaurant'],
    });
    if (!order) throw new NotFoundException('Order not found');

    // Validate authorization
    this.validateStatusChangeAuthorization(order, userId, userRole, dto.status);

    // Validate transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}. Allowed: ${allowedTransitions.join(', ')}`,
      );
    }

    // Update order status
    order.status = dto.status;
    if (dto.status === OrderStatus.DELIVERED) {
      order.deliveryPartnerId = order.deliveryPartnerId; // already set by delivery module
    }
    const updated = await this.orderRepo.save(order);

    // Record history
    await this.recordStatusHistory(orderId, dto.status, userId);

    // Send notifications based on status
    await this.sendStatusNotifications(updated, dto.status);

    this.logger.log(`Order ${orderId} status: ${dto.status} by ${userRole} ${userId}`);

    return updated;
  }

  async findById(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'statusHistory', 'restaurant', 'deliveryAddress'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByCustomer(customerId: string, query: OrderQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(query.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const where: Record<string, unknown> = { customerId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'restaurant'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByRestaurant(restaurantId: string, query: OrderQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(query.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const where: Record<string, unknown> = { restaurantId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'deliveryAddress'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStatusHistory(orderId: string) {
    return this.statusHistoryRepo.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  // ─── Helpers ───────────────────────────────────────────

  private validateStatusChangeAuthorization(
    order: OrderEntity,
    userId: string,
    userRole: UserRole,
    newStatus: OrderStatus,
  ) {
    const restaurantStatuses = [
      OrderStatus.ACCEPTED, OrderStatus.PREPARING,
      OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED,
    ];
    const deliveryStatuses = [
      OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED,
    ];

    if (userRole === UserRole.RESTAURANT_OWNER || userRole === UserRole.RESTAURANT_STAFF) {
      if (!restaurantStatuses.includes(newStatus)) {
        throw new ForbiddenException('Restaurant cannot set this status');
      }
      if (order.restaurant.ownerId !== userId) {
        throw new ForbiddenException('Not your restaurant order');
      }
    } else if (userRole === UserRole.DELIVERY_PARTNER) {
      if (!deliveryStatuses.includes(newStatus)) {
        throw new ForbiddenException('Delivery partner cannot set this status');
      }
    } else if (userRole === UserRole.CUSTOMER) {
      if (newStatus !== OrderStatus.CANCELLED) {
        throw new ForbiddenException('Customers can only cancel orders');
      }
      if (order.customerId !== userId) {
        throw new ForbiddenException('Not your order');
      }
    } else if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Unauthorized');
    }
  }

  private async recordStatusHistory(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    notes?: string,
  ) {
    await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        orderId,
        status,
        changedBy,
        notes: notes || null,
      }),
    );
  }

  private async sendStatusNotifications(order: OrderEntity, status: OrderStatus) {
    const statusMessages: Record<string, { title: string; body: string }> = {
      [OrderStatus.ACCEPTED]: { title: 'Order Accepted!', body: 'Your order is being prepared' },
      [OrderStatus.PREPARING]: { title: 'Preparing Your Order', body: 'The restaurant is cooking your food' },
      [OrderStatus.READY_FOR_PICKUP]: { title: 'Order Ready!', body: 'Your order is ready for pickup' },
      [OrderStatus.PICKED_UP]: { title: 'Order Picked Up', body: 'Your order is on its way' },
      [OrderStatus.OUT_FOR_DELIVERY]: { title: 'Out for Delivery', body: 'Your food is almost there!' },
      [OrderStatus.DELIVERED]: { title: 'Order Delivered!', body: 'Enjoy your meal! Rate your experience.' },
      [OrderStatus.CANCELLED]: { title: 'Order Cancelled', body: 'Your order has been cancelled' },
    };

    const msg = statusMessages[status];
    if (msg) {
      await this.notificationsService.send(
        order.customerId,
        msg.title,
        msg.body,
        NotificationType.ORDER_UPDATE,
        { orderId: order.id, status },
      );
    }
  }
}
