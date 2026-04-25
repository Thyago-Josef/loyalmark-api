import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { Company } from '@/company/entities/company.entity';

@Entity('user_companies')
export class UserCompany {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user) => user.userCompanies)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Company, (company) => company.userCompanies)
    @JoinColumn({ name: 'companyId' })
    company!: Company;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}