import { ApprovalStatus, FoodType } from './enums';

export interface IRestaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  closingHours: string;
  cuisineType: string[];
  minOrderAmount: number;
  deliveryFee: number;
  avgDeliveryTime: number;
  rating: number;
  totalRatings: number;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateRestaurant {
  name: string;
  description?: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  closingHours: string;
  cuisineType: string[];
  minOrderAmount: number;
  deliveryFee: number;
  avgDeliveryTime: number;
}

export interface IUpdateRestaurant {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  closingHours?: string;
  cuisineType?: string[];
  minOrderAmount?: number;
  deliveryFee?: number;
  avgDeliveryTime?: number;
  isActive?: boolean;
}

export interface IMenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMenuCategory {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface IMenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  foodType: FoodType;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMenuItem {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  foodType: FoodType;
  sortOrder?: number;
}

export interface IUpdateMenuItem {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  foodType?: FoodType;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface IMenuItemAddon {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMenuItemAddon {
  name: string;
  price: number;
}

export interface IRestaurantStaff {
  id: string;
  userId: string;
  restaurantId: string;
  role: string;
  createdAt: Date;
}
