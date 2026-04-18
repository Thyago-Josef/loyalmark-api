import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Offer } from '../../offer/entities/offer.entity';

export enum UserRole {
    ADMIN = 'admin',
    MERCHANT = 'merchant',
    CUSTOMER = 'customer',
}

// src/user/entities/user.entity.ts

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, nullable: false })
    email!: string;

    @Column({ select: false })
    password!: string;

    @Column()
    name!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role!: UserRole;

    // 💡 A CHAVE DO MULTI-TENANCY:
    // Identifica a qual empresa este usuário pertence.
    @Column({ nullable: true }) // Pode ser nullable se o ADMIN não pertencer a uma empresa
    companyId!: string;

    @OneToMany(() => Offer, (offer) => offer.creator)
    offers!: Offer[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
