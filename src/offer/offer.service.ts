import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) { }

  async create(createOfferDto: CreateOfferDto, companyId: string) {
    // 💡 REGRA DE NEGÓCIO: O desconto não pode ser maior que o preço original
    if (createOfferDto.discountPrice >= createOfferDto.originalPrice) {
      throw new BadRequestException('O preço com desconto deve ser menor que o preço original.');
    }

    // Criamos a instância da oferta
    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      companyId,
    });

    // Salvamos no PostgreSQL
    return await this.offerRepository.save(newOffer);
  }

  async findAll() {
    // 💡 VISÃO DE NEGÓCIO: Listar as Premium primeiro para dar lucro!
    return await this.offerRepository.find({
      order: {
        isPremium: 'DESC',
        expiresAt: 'ASC',
      },
    });
  }
}