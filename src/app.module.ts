import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OfferModule } from './offer/offer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer/entities/offer.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres', // mude para o seu usuário
    password: 'password123',      // mude para a sua senha
    database: 'loyalmark_db',
    entities: [Offer],
    synchronize: true, // Isso cria as tabelas automaticamente
  }), OfferModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
