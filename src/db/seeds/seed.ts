// src/db/seeds/seed.ts
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Company } from '@/company/entities/company.entity';
import { User, UserRole } from '@/user/entities/user.entity';
import { Offer } from '@/offer/entities/offer.entity';

export const runSeed = async (dataSource: DataSource) => {
    console.log('🧹 Limpando tabelas...');
    await dataSource.query('TRUNCATE TABLE companies, users, offers RESTART IDENTITY CASCADE');

    const companyRepository = dataSource.getRepository(Company);
    const userRepository = dataSource.getRepository(User);
    const offerRepository = dataSource.getRepository(Offer);

    console.log('🌱 Iniciando Seed...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. CRIAR 3 ADMINS MASTER
    console.log('👥 Criando Admins Master...');
    for (let i = 1; i <= 3; i++) {
        await userRepository.save(
            userRepository.create({
                name: i === 1 ? 'Admin Master' : `Admin Assistente ${i}`,
                email: i === 1 ? 'admin@loyalmark.com' : `admin${i}@loyalmark.com`,
                password: hashedPassword,
                role: UserRole.ADMIN,
                // Não passamos companyId nem company, o TypeORM colocará NULL
            })
        );
    }
    // 2. CRIAR 10 EMPRESAS COM 4 LOJISTAS CADA
    console.log('🏢 Criando 10 Empresas e Lojistas...');

    for (let i = 1; i <= 10; i++) {
        const companyName = faker.company.name();
        const company = await companyRepository.save(
            companyRepository.create({
                name: companyName,
                slug: faker.helpers.slugify(companyName).toLowerCase(),
            })
        );

        // Criar 4 Lojistas (Merchants) para cada empresa
        for (let j = 1; j <= 4; j++) {
            const merchant = await userRepository.save(
                userRepository.create({
                    name: faker.person.fullName(),
                    email: `merchant${j}@company${i}.com`,
                    password: hashedPassword,
                    role: UserRole.MERCHANT,
                    companyId: company.id, // <--- Vinculado à empresa atual
                })
            );

            // 3. CRIAR OFERTAS PARA CADA EMPRESA (Usando um dos lojistas como criador)
            if (j === 1) { // Apenas o primeiro lojista cria algumas ofertas iniciais
                const offers = Array.from({ length: 3 }).map(() => {
                    const originalPrice = parseFloat(faker.commerce.price({ min: 100, max: 1000 }));
                    return offerRepository.create({
                        title: faker.commerce.productName(),
                        originalPrice,
                        discountPrice: originalPrice * 0.8,
                        couponLimit: 50,
                        expiresAt: faker.date.future(),
                        companyId: company.id,
                        creatorId: merchant.id,
                    });
                });
                await offerRepository.save(offers);
            }
        }
    }

    console.log('✅ Seed finalizado com sucesso!');
    console.log('📊 Resumo: 3 Admins, 10 Empresas, 40 Lojistas.');
};