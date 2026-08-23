import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { CartEntity } from './cart.entity';
import { MenuItemEntity } from './menu-item.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'cart_id' })
  cartId: string;

  @Column({ type: 'text', name: 'menu_item_id' })
  menuItemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true, name: 'special_instructions' })
  specialInstructions: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  addons: string[];

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => MenuItemEntity)
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItemEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
