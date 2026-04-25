import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { Offer } from '@/offer/entities/offer.entity';
import { UserCompany } from '@/client/entities/user-company.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @OneToMany(() => User, (user) => user.company)
  users!: User[];

  @OneToMany(() => Offer, (offer) => offer.company)
  offers!: Offer[];

  @OneToMany(() => UserCompany, (uc) => uc.company)
  userCompanies!: UserCompany[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt: Date | undefined;
}
