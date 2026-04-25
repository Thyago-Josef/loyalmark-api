import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OfferPublicController } from './offer-public.controller';
import { Offer } from './entities/offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer])],
  controllers: [OfferController, OfferPublicController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
