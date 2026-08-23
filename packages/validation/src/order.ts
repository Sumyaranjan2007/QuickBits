import { z } from 'zod';
import { PaymentMethod } from '@quickbite/types';
import { uuidSchema } from './common';

export const createOrderItemSchema = z.object({
  menuItemId: uuidSchema,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  addons: z.array(uuidSchema).optional(),
  specialInstructions: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  restaurantId: uuidSchema,
  deliveryAddressId: uuidSchema,
  items: z.array(createOrderItemSchema).min(1, 'At least one item is required'),
  specialInstructions: z.string().max(500).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().optional(),
});

export const addToCartSchema = z.object({
  restaurantId: uuidSchema,
  menuItemId: uuidSchema,
  quantity: z.number().int().min(1),
  addons: z.array(uuidSchema).optional(),
  specialInstructions: z.string().max(500).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  addons: z.array(uuidSchema).optional(),
  specialInstructions: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
