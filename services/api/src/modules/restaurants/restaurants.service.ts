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
    Object.assign(item, dto);
    return this.menuItemRepo.save(item);
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
