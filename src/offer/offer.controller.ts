import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('offers') // A URL será http://localhost:3000/offers
export class OfferController {
  constructor(private readonly offerService: OfferService) { }

  @Post(':companyId') // Ex: POST /offers/id-da-loja
  async create(
    @Param('companyId') companyId: string,
    @Body() createOfferDto: CreateOfferDto,
  ) {
    return this.offerService.create(createOfferDto, companyId);
  }

  @Get() // Ex: GET /offers
  async findAll() {
    return this.offerService.findAll();
  }
}