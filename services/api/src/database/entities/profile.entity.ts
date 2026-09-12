import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn } from 'typeorm';
import type { UserEntity } from './user.entity';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @Column({ type: 'text', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'text', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'text', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @OneToOne('UserEntity', (user: any) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
