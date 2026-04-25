import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OfferModule } from './offer/offer.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { ClientModule } from './client/client.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Tempo de vida em milissegundos (1 minuto)
        limit: 10, // Limite global de 10 requisições por minuto
      },
    ]),
    // 2. Configure o ConfigModule como Global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 3. Use forRootAsync para injetar as variáveis do .env no Banco
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, // 👈 Isso evita ter que listar cada entidade [Offer, User] manualmente
        synchronize: true, // ⚠️ Use apenas em desenvolvimento!
      }),
    }),

    AuthModule,
    CompanyModule,
    UserModule,
    OfferModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Isso ativa a proteção em todas as rotas!
    },
  ],
})
export class AppModule {}
