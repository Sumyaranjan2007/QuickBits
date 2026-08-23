import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'text', length: 50 })
  label: string;

  @Column({ type: 'text', name: 'address_line_1' })
  addressLine1: string;

  @Column({ type: 'text', nullable: true, name: 'address_line_2' })
  addressLine2: string | null;

  @Column({ type: 'text', length: 100 })
  city: string;

  @Column({ type: 'text', length: 100 })
  state: string;

  @Column({ type: 'text', length: 10, name: 'postal_code' })
  postalCode: string;

  @Column({ type: 'real' })
  latitude: number;

  @Column({ type: 'real' })
  longitude: number;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
