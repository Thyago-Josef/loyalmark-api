import { Company } from '@/company/entities/company.entity';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  originalPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discountPrice!: number;

  @Column({ default: 0 })
  couponLimit!: number;

  @Column({ default: 0 })
  couponsIssued!: number;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ default: false })
  isPremium!: boolean;

  @ManyToOne(() => Company, (company) => company.offers)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  // 2. A Coluna Física (O que você já deve ter aí)
  @Column()
  companyId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.offers)
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @Column({ name: 'creator_id' })
  creatorId!: string;
}
