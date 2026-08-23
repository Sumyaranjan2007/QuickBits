import { Inject, Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto, UpdateRestaurantDto,
  CreateMenuCategoryDto, UpdateMenuCategoryDto,
  CreateMenuItemDto, UpdateMenuItemDto,
  CreateAddonDto, UpdateAddonDto,
  RestaurantQueryDto,
} from './dto/restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(@Inject(RestaurantsService) private readonly restaurantsService: RestaurantsService) {}

  // ─── Public Endpoints ──────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List restaurants (public)' })
  async findAll(@Query() query: RestaurantQueryDto): Promise<IApiResponse> {
    const data = await this.restaurantsService.findAll(query);
    return { success: true, data, message: 'Restaurants retrieved' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant with full menu (public)' })
  async findById(@Param('id') id: string): Promise<IApiResponse> {
    const data = await this.restaurantsService.findById(id);
    return { success: true, data, message: 'Restaurant retrieved' };
  }

  // ─── Owner Endpoints ───────────────────────────────────

  @Get('owner/my-restaurants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my restaurants (owner)' })
  async findMyRestaurants(@CurrentUser('id') ownerId: string): Promise<IApiResponse> {
    const data = await this.restaurantsService.findByOwner(ownerId);
    return { success: true, data, message: 'Your restaurants retrieved' };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a restaurant (owner)' })
  async create(
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateRestaurantDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.create(ownerId, dto);
    return { success: true, data, message: 'Restaurant created (pending approval)' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update restaurant (owner)' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.update(id, ownerId, dto);
    return { success: true, data, message: 'Restaurant updated' };
  }

  // ─── Menu Category ─────────────────────────────────────

  @Post(':restaurantId/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create menu category (owner)' })
  async createCategory(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateMenuCategoryDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.createCategory(restaurantId, ownerId, dto);
    return { success: true, data, message: 'Category created' };
  }

  @Put('categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update menu category (owner)' })
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.updateCategory(categoryId, ownerId, dto);
    return { success: true, data, message: 'Category updated' };
  }

  @Delete('categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete menu category (owner)' })
  async deleteCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUser('id') ownerId: string,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.deleteCategory(categoryId, ownerId);
    return { success: true, data, message: data.message };
  }

  // ─── Menu Items ────────────────────────────────────────

  @Post(':restaurantId/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create menu item (owner)' })
  async createMenuItem(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateMenuItemDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.createMenuItem(restaurantId, ownerId, dto);
    return { success: true, data, message: 'Menu item created' };
  }

  @Put('items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update menu item (owner)' })
  async updateMenuItem(
    @Param('itemId') itemId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: UpdateMenuItemDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.updateMenuItem(itemId, ownerId, dto);
    return { success: true, data, message: 'Menu item updated' };
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete menu item (owner)' })
  async deleteMenuItem(
    @Param('itemId') itemId: string,
    @CurrentUser('id') ownerId: string,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.deleteMenuItem(itemId, ownerId);
    return { success: true, data, message: data.message };
  }

  @Patch('items/:itemId/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle menu item availability (owner)' })
  async toggleItemAvailability(
    @Param('itemId') itemId: string,
    @CurrentUser('id') ownerId: string,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.toggleItemAvailability(itemId, ownerId);
    return { success: true, data, message: `Item ${data.isAvailable ? 'enabled' : 'disabled'}` };
  }

  // ─── Addons ────────────────────────────────────────────

  @Post('items/:menuItemId/addons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create addon for menu item (owner)' })
  async createAddon(
    @Param('menuItemId') menuItemId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateAddonDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.createAddon(menuItemId, ownerId, dto);
    return { success: true, data, message: 'Addon created' };
  }

  @Put('addons/:addonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update addon (owner)' })
  async updateAddon(
    @Param('addonId') addonId: string,
    @CurrentUser('id') ownerId: string,
    @Body() dto: UpdateAddonDto,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.updateAddon(addonId, ownerId, dto);
    return { success: true, data, message: 'Addon updated' };
  }

  @Delete('addons/:addonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete addon (owner)' })
  async deleteAddon(
    @Param('addonId') addonId: string,
    @CurrentUser('id') ownerId: string,
  ): Promise<IApiResponse> {
    const data = await this.restaurantsService.deleteAddon(addonId, ownerId);
    return { success: true, data, message: data.message };
  }
}
