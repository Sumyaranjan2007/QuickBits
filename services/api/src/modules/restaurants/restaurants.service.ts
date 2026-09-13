import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { RestaurantEntity } from '../../database/entities/restaurant.entity';
import { MenuCategoryEntity } from '../../database/entities/menu-category.entity';
import { MenuItemEntity } from '../../database/entities/menu-item.entity';
import { MenuItemAddonEntity } from '../../database/entities/menu-item-addon.entity';
import { ApprovalStatus, UserRole } from '@quickbite/types';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@quickbite/config';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateAddonDto,
  UpdateAddonDto,
  RestaurantQueryDto,
} from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(MenuCategoryEntity)
    private readonly categoryRepo: Repository<MenuCategoryEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(MenuItemAddonEntity)
    private readonly addonRepo: Repository<MenuItemAddonEntity>,
  ) {}

  // ─── Restaurant CRUD ───────────────────────────────────

  async findAll(query: RestaurantQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(query.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const qb = this.restaurantRepo.createQueryBuilder('r')
      .where('r.approval_status = :status', { status: ApprovalStatus.APPROVED })
      .andWhere('r.is_active = :active', { active: true });

    if (query.search) {
      qb.andWhere('(r.name LIKE :search OR r.address LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.cuisine) {
      // cuisine_type is stored as simple-array (comma-separated)
      qb.andWhere('r.cuisineType LIKE :cuisine', { cuisine: `%${query.cuisine}%` });
    }

    if (query.minRating) {
      qb.andWhere('r.rating >= :minRating', { minRating: query.minRating });
    }

    // Sorting
    const sortBy = ['rating', 'avg_delivery_time', 'delivery_fee', 'name'].includes(query.sortBy || '')
      ? `r.${query.sortBy}` : 'r.rating';
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortBy, sortOrder);

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findById(id: string) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['menuCategories', 'menuCategories.items', 'menuCategories.items.addons'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findByOwner(ownerId: string) {
    return this.restaurantRepo.find({ where: { ownerId } });
  }

  async create(ownerId: string, dto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepo.create({
      ...dto,
      ownerId,
      approvalStatus: ApprovalStatus.PENDING,
    });
    const saved = await this.restaurantRepo.save(restaurant);
    this.logger.log(`Restaurant created: ${saved.id} by owner ${ownerId}`);
    return saved;
  }

  async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.getOwnedRestaurant(id, ownerId);
    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  // ─── Approval (Admin) ──────────────────────────────────

  async updateApprovalStatus(id: string, status: ApprovalStatus) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    restaurant.approvalStatus = status;
    if (status === ApprovalStatus.SUSPENDED) {
      restaurant.isActive = false;
    }
    return this.restaurantRepo.save(restaurant);
  }

  async updateCommission(id: string, rate: number) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    restaurant.commissionRate = rate;
    return this.restaurantRepo.save(restaurant);
  }

  // ─── Menu Category CRUD ────────────────────────────────

  async createCategory(restaurantId: string, ownerId: string, dto: CreateMenuCategoryDto) {
    await this.getOwnedRestaurant(restaurantId, ownerId);
    const category = this.categoryRepo.create({ ...dto, restaurantId });
    return this.categoryRepo.save(category);
  }

  async updateCategory(categoryId: string, ownerId: string, dto: UpdateMenuCategoryDto) {
    const category = await this.getOwnedCategory(categoryId, ownerId);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(categoryId: string, ownerId: string) {
    const category = await this.getOwnedCategory(categoryId, ownerId);
    await this.categoryRepo.remove(category);
    return { message: 'Category deleted' };
  }

  // ─── Menu Item CRUD ────────────────────────────────────

  async createMenuItem(restaurantId: string, ownerId: string, dto: CreateMenuItemDto) {
    const restaurant = await this.getOwnedRestaurant(restaurantId, ownerId);
    // Verify category belongs to this restaurant
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId, restaurantId },
    });
    if (!category) throw new NotFoundException('Category not found in this restaurant');

    const item = this.menuItemRepo.create({
      ...dto,
      restaurantId,
    });
    return this.menuItemRepo.save(item);
  }

  async updateMenuItem(itemId: string, ownerId: string, dto: UpdateMenuItemDto) {
    const item = await this.getOwnedMenuItem(itemId, ownerId);
    // STRICT BUSINESS RULE: Strip out price if sent by restaurant owner
    const { price, ...safeDto } = dto as any;
    Object.assign(item, safeDto);
    return this.menuItemRepo.save(item);
  }

  // ─── Price Change Request System ────────────────────────
  private priceRequests: any[] = [
    {
      id: 'pr-101',
      restaurantId: 'rest-1',
      restaurantName: 'QuickBite Bistro',
      menuItemId: 'item-1',
      menuItemName: 'Hyderabadi Chicken Dum Biryani',
      currentPrice: 249,
      requestedPrice: 279,
      priceDiff: 30,
      priceDiffPercent: 12,
      reason: 'Raw chicken and basmati rice procurement costs increased by 15%',
      note: 'Supplier invoice available upon request',
      status: 'PENDING',
      requestedBy: 'restaurant@quickbite.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'pr-100',
      restaurantId: 'rest-1',
      restaurantName: 'QuickBite Bistro',
      menuItemId: 'item-2',
      menuItemName: 'Paneer Butter Masala',
      currentPrice: 200,
      requestedPrice: 220,
      priceDiff: 20,
      priceDiffPercent: 10,
      reason: 'Dairy and butter market rate revision',
      status: 'APPROVED',
      approvedBy: 'admin@quickbite.com',
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      requestedBy: 'restaurant@quickbite.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'pr-99',
      restaurantId: 'rest-1',
      restaurantName: 'QuickBite Bistro',
      menuItemId: 'item-3',
      menuItemName: 'Crispy Peri Peri Fries',
      currentPrice: 120,
      requestedPrice: 160,
      priceDiff: 40,
      priceDiffPercent: 33,
      reason: 'Portion size increase',
      adminReason: 'Price increase exceeds 25% cap without verified portion resize approval.',
      status: 'REJECTED',
      approvedBy: 'admin@quickbite.com',
      requestedBy: 'restaurant@quickbite.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    },
  ];

  private priceAuditLogs: any[] = [
    {
      id: 'audit-1',
      requestId: 'pr-100',
      restaurantId: 'rest-1',
      restaurantName: 'QuickBite Bistro',
      menuItemId: 'item-2',
      menuItemName: 'Paneer Butter Masala',
      oldPrice: 200,
      newPrice: 220,
      requestedBy: 'restaurant@quickbite.com',
      approvedBy: 'admin@quickbite.com',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      reason: 'Dairy and butter market rate revision',
    },
  ];

  async createPriceRequest(
    restaurantId: string,
    itemId: string,
    ownerId: string,
    dto: { requestedPrice: number; reason: string; note?: string },
  ) {
    const restaurant = await this.getOwnedRestaurant(restaurantId, ownerId);
    const item = await this.menuItemRepo.findOne({ where: { id: itemId, restaurantId } });
    if (!item) throw new NotFoundException('Menu item not found in your restaurant');

    // Check if there is already a PENDING request for this item
    const existingPending = this.priceRequests.find(
      r => r.menuItemId === itemId && r.status === 'PENDING',
    );
    if (existingPending) {
      throw new BadRequestException('A price change request is already pending approval for this item');
    }

    const currentPrice = Number(item.price);
    const requestedPrice = Number(dto.requestedPrice);
    if (isNaN(requestedPrice) || requestedPrice <= 0) {
      throw new BadRequestException('Requested price must be a valid positive number');
    }

    const priceDiff = requestedPrice - currentPrice;
    const priceDiffPercent = Math.round((priceDiff / currentPrice) * 100);

    const newRequest = {
      id: `pr-${Date.now()}`,
      restaurantId,
      restaurantName: restaurant.name,
      menuItemId: item.id,
      menuItemName: item.name,
      currentPrice,
      requestedPrice,
      priceDiff,
      priceDiffPercent,
      reason: dto.reason,
      note: dto.note || '',
      status: 'PENDING',
      requestedBy: ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.priceRequests.unshift(newRequest);
    return newRequest;
  }

  async getRestaurantPriceRequests(restaurantId: string, ownerId: string) {
    await this.getOwnedRestaurant(restaurantId, ownerId);
    return this.priceRequests.filter(r => r.restaurantId === restaurantId || r.restaurantId === 'rest-1');
  }

  async getAllPriceRequests() {
    return this.priceRequests;
  }

  async approvePriceRequest(requestId: string, adminId: string) {
    const request = this.priceRequests.find(r => r.id === requestId);
    if (!request) throw new NotFoundException('Price change request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    // 1. Update live price on the menu item
    const item = await this.menuItemRepo.findOne({ where: { id: request.menuItemId } });
    if (item) {
      item.price = request.requestedPrice;
      await this.menuItemRepo.save(item);
    }

    // 2. Mark request approved
    request.status = 'APPROVED';
    request.approvedBy = adminId || 'admin@quickbite.com';
    request.approvedAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();

    // 3. Add to immutable audit trail
    const auditEntry = {
      id: `audit-${Date.now()}`,
      requestId: request.id,
      restaurantId: request.restaurantId,
      restaurantName: request.restaurantName,
      menuItemId: request.menuItemId,
      menuItemName: request.menuItemName,
      oldPrice: request.currentPrice,
      newPrice: request.requestedPrice,
      requestedBy: request.requestedBy,
      approvedBy: request.approvedBy,
      requestedAt: request.createdAt,
      approvedAt: request.approvedAt,
      reason: request.reason,
    };
    this.priceAuditLogs.unshift(auditEntry);

    return { request, audit: auditEntry, message: 'Price change approved and live price updated' };
  }

  async rejectPriceRequest(requestId: string, adminId: string, reason: string) {
    const request = this.priceRequests.find(r => r.id === requestId);
    if (!request) throw new NotFoundException('Price change request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    // Mark request rejected with admin reason (live price remains unchanged)
    request.status = 'REJECTED';
    request.adminReason = reason || 'Rejected by platform administrator';
    request.approvedBy = adminId || 'admin@quickbite.com';
    request.updatedAt = new Date().toISOString();

    return { request, message: 'Price change request rejected' };
  }

  async getPriceAuditHistory() {
    return this.priceAuditLogs;
  }

  async deleteMenuItem(itemId: string, ownerId: string) {
    const item = await this.getOwnedMenuItem(itemId, ownerId);
    await this.menuItemRepo.remove(item);
    return { message: 'Menu item deleted' };
  }

  async toggleItemAvailability(itemId: string, ownerId: string) {
    const item = await this.getOwnedMenuItem(itemId, ownerId);
    item.isAvailable = !item.isAvailable;
    return this.menuItemRepo.save(item);
  }

  // ─── Addon CRUD ────────────────────────────────────────

  async createAddon(menuItemId: string, ownerId: string, dto: CreateAddonDto) {
    await this.getOwnedMenuItem(menuItemId, ownerId);
    const addon = this.addonRepo.create({ ...dto, menuItemId, isAvailable: true });
    return this.addonRepo.save(addon);
  }

  async updateAddon(addonId: string, ownerId: string, dto: UpdateAddonDto) {
    const addon = await this.getOwnedAddon(addonId, ownerId);
    Object.assign(addon, dto);
    return this.addonRepo.save(addon);
  }

  async deleteAddon(addonId: string, ownerId: string) {
    const addon = await this.getOwnedAddon(addonId, ownerId);
    await this.addonRepo.remove(addon);
    return { message: 'Addon deleted' };
  }

  // ─── Ownership Helpers ─────────────────────────────────

  private async getOwnedRestaurant(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Not your restaurant');
    return restaurant;
  }

  private async getOwnedCategory(categoryId: string, ownerId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['restaurant'],
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category.restaurant.ownerId !== ownerId) throw new ForbiddenException('Not your restaurant');
    return category;
  }

  private async getOwnedMenuItem(itemId: string, ownerId: string) {
    const item = await this.menuItemRepo.findOne({
      where: { id: itemId },
      relations: ['restaurant'],
    });
    if (!item) throw new NotFoundException('Menu item not found');
    if (item.restaurant.ownerId !== ownerId) throw new ForbiddenException('Not your restaurant');
    return item;
  }

  private async getOwnedAddon(addonId: string, ownerId: string) {
    const addon = await this.addonRepo.findOne({
      where: { id: addonId },
      relations: ['menuItem', 'menuItem.restaurant'],
    });
    if (!addon) throw new NotFoundException('Addon not found');
    if (addon.menuItem.restaurant.ownerId !== ownerId) throw new ForbiddenException('Not your restaurant');
    return addon;
  }
}
