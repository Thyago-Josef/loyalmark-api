// src/db/seeds/seed.ts
import { DataSource } from 'typeorm';

import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Company } from '@/company/entities/company.entity';
import { User, UserRole } from '@/user/entities/user.entity';
import { Offer } from '@/offer/entities/offer.entity';

export const runSeed = async (dataSource: DataSource) => {
    const companyRepository = dataSource.getRepository(Company);
    const userRepository = dataSource.getRepository(User);
    const offerRepository = dataSource.getRepository(Offer);

    console.log('🌱 Iniciando Seed...');

    // 1. Criar a Empresa Master (Tenant principal)
    const company = companyRepository.create({
        name: 'LoyalMark Retail',
        slug: 'loyalmark-retail',
    });
    await companyRepository.save(company);

    // 2. Criar um Usuário Admin (Master)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
        name: 'Admin Master',
        email: 'admin@loyalmark.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        companyId: company.id,
    });
    await userRepository.save(admin);

    // 3. Criar Ofertas Fakes para esta empresa
    const offers = Array.from({ length: 5 }).map(() => {
        const originalPrice = parseFloat(faker.commerce.price({ min: 100, max: 500 }));
        return offerRepository.create({
            title: faker.commerce.productName(),
            originalPrice,
            discountPrice: originalPrice * 0.7,
            couponLimit: 100,
            expiresAt: faker.date.future(),
            companyId: company.id,
            creatorId: admin.id,
        });
    });

    await offerRepository.save(offers);

    console.log('✅ Seed finalizado com sucesso!');
    console.log('👤 User: admin@loyalmark.com | Pass: admin123');
};