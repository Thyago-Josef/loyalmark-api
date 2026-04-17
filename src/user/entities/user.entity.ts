import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Offer } from '../../offer/entities/offer.entity';

export enum UserRole {
    ADMIN = 'admin',
    MERCHANT = 'merchant',
    CUSTOMER = 'customer',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, nullable: false })
    email!: string;

    @Column({ select: false }) // O password não virá em buscas simples por segurança
    password!: string;

    @Column()
    name!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role!: UserRole;

    // Relacionamento: Um lojista pode ter várias ofertas
    @OneToMany(() => Offer, (offer) => offer.creator)
    offers!: Offer[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
