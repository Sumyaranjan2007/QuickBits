import { z } from 'zod';
import { FoodType } from '@quickbite/types';
import { latitudeSchema, longitudeSchema, nameSchema, priceSchema } from './common';

export const createRestaurantSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  openingHours: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  closingHours: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  cuisineType: z.array(z.string()).min(1, 'At least one cuisine type is required'),
  minOrderAmount: priceSchema.default(0),
  deliveryFee: priceSchema.default(0),
  avgDeliveryTime: z.number().int().min(1).default(30),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const createMenuCategorySchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: nameSchema,
  description: z.string().max(500).optional(),
  price: priceSchema.refine((val) => val > 0, 'Price must be greater than 0'),
  imageUrl: z.string().url().optional(),
  foodType: z.nativeEnum(FoodType),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateMenuItemSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(500).optional(),
  price: priceSchema.optional(),
  imageUrl: z.string().url().nullable().optional(),
  foodType: z.nativeEnum(FoodType).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createMenuItemAddonSchema = z.object({
  name: nameSchema,
  price: priceSchema,
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
