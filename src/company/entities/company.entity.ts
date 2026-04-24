import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { User } from '@/user/entities/user.entity'; // Lembre do seu alias @/
import { Offer } from '@/offer/entities/offer.entity';

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @DeleteDateColumn()
    deletedAt: Date | undefined;
}