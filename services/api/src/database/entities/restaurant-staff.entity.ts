import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { RestaurantEntity } from './restaurant.entity';

@Entity('restaurant_staff')
export class RestaurantStaffEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @Column({ type: 'text', name: 'restaurant_id' })
  restaurantId: string;

  @Column({ type: 'text', length: 50, default: 'staff' })
  role: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RestaurantEntity)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
