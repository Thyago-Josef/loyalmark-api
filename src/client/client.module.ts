import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { UserCompany } from './entities/user-company.entity';
import { UserModule } from '@/user/user.module';
import { OfferModule } from '@/offer/offer.module';
import { CompanyModule } from '@/company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCompany]),
    UserModule,
    OfferModule,
    CompanyModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}