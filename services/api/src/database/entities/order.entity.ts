import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index } from 'typeorm';
import { OrderStatus, PaymentMethod } from '@quickbite/types';
import { UserEntity } from './user.entity';
import { RestaurantEntity } from './restaurant.entity';
import { AddressEntity } from './address.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'customer_id' })
  @Index()
  customerId: string;

  @Column({ type: 'text', name: 'restaurant_id' })
  @Index()
  restaurantId: string;

  @Column({ type: 'text', name: 'delivery_address_id' })
  deliveryAddressId: string;

  @Column({ type: 'text', nullable: true, name: 'delivery_partner_id' })
  deliveryPartnerId: string | null;

  @Column({ type: 'text', enum: OrderStatus, default: OrderStatus.PENDING })
  @Index()
  status: OrderStatus;

  @Column({ type: 'real', default: 0 })
  subtotal: number;

  @Column({ type: 'real', default: 0, name: 'delivery_fee' })
  deliveryFee: number;

  @Column({ type: 'real', default: 0, name: 'platform_fee' })
  platformFee: number;

  @Column({ type: 'real', default: 0 })
  tax: number;

  @Column({ type: 'real', default: 0 })
  discount: number;

  @Column({ type: 'text', nullable: true, name: 'coupon_id' })
  couponId: string | null;

  @Column({ type: 'real', default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true, name: 'special_instructions' })
  specialInstructions: string | null;

  @Column({ type: 'text', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity;

  @ManyToOne(() => RestaurantEntity)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @ManyToOne(() => AddressEntity)
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: AddressEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { eager: true })
  items: OrderItemEntity[];

  @OneToMany(() => OrderStatusHistoryEntity, (history) => history.order)
  statusHistory: OrderStatusHistoryEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
