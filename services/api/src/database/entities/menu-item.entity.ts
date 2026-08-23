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
import { FoodType } from '@quickbite/types';
import { MenuCategoryEntity } from './menu-category.entity';
import { RestaurantEntity } from './restaurant.entity';
import { MenuItemAddonEntity } from './menu-item-addon.entity';

@Entity('menu_items')
export class MenuItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'category_id' })
  categoryId: string;

  @Column({ type: 'text', name: 'restaurant_id' })
  @Index()
  restaurantId: string;

  @Column({ type: 'text', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'real' })
  price: number;

  @Column({ type: 'text', length: 500, nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @Column({ type: 'text', enum: FoodType, name: 'food_type' })
  foodType: FoodType;

  @Column({ type: 'boolean', default: true, name: 'is_available' })
  isAvailable: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @ManyToOne(() => MenuCategoryEntity, (category) => category.items)
  @JoinColumn({ name: 'category_id' })
  category: MenuCategoryEntity;

  @ManyToOne(() => RestaurantEntity)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @OneToMany(() => MenuItemAddonEntity, (addon) => addon.menuItem)
  addons: MenuItemAddonEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
