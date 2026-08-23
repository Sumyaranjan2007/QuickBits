import { PayoutStatus } from './enums';

export interface IRestaurantPayout {
  id: string;
  restaurantId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: PayoutStatus;
  transactionId: string | null;
  createdAt: Date;
}

export interface IDeliveryPayout {
  id: string;
  deliveryPartnerId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: PayoutStatus;
  transactionId: string | null;
  createdAt: Date;
}
