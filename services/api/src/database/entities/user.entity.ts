import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index } from 'typeorm';
import { UserRole } from '@quickbite/types';
import type { ProfileEntity } from './profile.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', length: 255, nullable: true, unique: true })
  @Index()
  email: string | null;

  @Column({ type: 'text', length: 20, nullable: true, unique: true })
  @Index()
  phone: string | null;

  @Column({ type: 'text', length: 255, nullable: true, name: 'password_hash' })
  passwordHash: string | null;

  @Column({ type: 'text', enum: UserRole, default: UserRole.CUSTOMER })
  @Index()
  role: UserRole;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'text', length: 255, nullable: true, name: 'google_id' })
  googleId: string | null;

  @Column({ type: 'text', length: 500, nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  @OneToOne('ProfileEntity', (profile: any) => profile.user, { eager: true })
  profile: ProfileEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
