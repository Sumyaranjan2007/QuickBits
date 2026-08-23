import { OrderStatus, PaymentMethod } from './enums';

export interface IOrder {
  id: string;
  customerId: string;
  restaurantId: string;
  deliveryAddressId: string;
  deliveryPartnerId: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  couponId: string | null;
  total: number;
  specialInstructions: string | null;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrder {
  restaurantId: string;
  deliveryAddressId: string;
  items: ICreateOrderItem[];
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addons: IOrderItemAddon[];
  subtotal: number;
}

export interface ICreateOrderItem {
  menuItemId: string;
  quantity: number;
  addons?: string[];
  specialInstructions?: string;
}

export interface IOrderItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface IOrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedBy: string;
  notes: string | null;
  createdAt: Date;
}

export interface ICart {
  id: string;
  customerId: string;
  restaurantId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  specialInstructions: string | null;
  addons: string[];
  createdAt: Date;
}

export interface IAddToCart {
  restaurantId: string;
  menuItemId: string;
  quantity: number;
  addons?: string[];
  specialInstructions?: string;
}

export interface IUpdateCartItem {
  quantity?: number;
  addons?: string[];
  specialInstructions?: string;
}

export interface IOrderSummary {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  total: number;
}
