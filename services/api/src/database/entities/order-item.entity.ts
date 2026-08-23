import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'order_id' })
  orderId: string;

  @Column({ type: 'text', name: 'menu_item_id' })
  menuItemId: string;

  @Column({ type: 'text', length: 255 })
  name: string;

  @Column({ type: 'real' })
  price: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'simple-json', default: '[]' })
  addons: { id: string; name: string; price: number }[];

  @Column({ type: 'real', default: 0 })
  subtotal: number;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
