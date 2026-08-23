import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';
import { RestaurantEntity } from './restaurant.entity';
import { DeliveryPartnerEntity } from './delivery-partner.entity';

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'order_id', unique: true })
  @Index()
  orderId: string;

  @Column({ type: 'text', name: 'customer_id' })
  @Index()
  customerId: string;

  @Column({ type: 'text', name: 'restaurant_id' })
  @Index()
  restaurantId: string;

  @Column({ type: 'text', nullable: true, name: 'delivery_partner_id' })
  deliveryPartnerId: string | null;

  @Column({ type: 'real', name: 'restaurant_rating' })
  restaurantRating: number;

  @Column({ type: 'real', name: 'food_rating' })
  foodRating: number;

  @Column({ type: 'real', nullable: true, name: 'delivery_rating' })
  deliveryRating: number | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity;

  @ManyToOne(() => RestaurantEntity)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @ManyToOne(() => DeliveryPartnerEntity)
  @JoinColumn({ name: 'delivery_partner_id' })
  deliveryPartner: DeliveryPartnerEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
