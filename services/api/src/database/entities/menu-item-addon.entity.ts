import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

@Entity('menu_item_addons')
export class MenuItemAddonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'menu_item_id' })
  menuItemId: string;

  @Column({ type: 'text', length: 255 })
  name: string;

  @Column({ type: 'real' })
  price: number;

  @Column({ type: 'boolean', default: true, name: 'is_available' })
  isAvailable: boolean;

  @ManyToOne(() => MenuItemEntity, (item) => item.addons)
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItemEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
