import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryScope } from '../common/decorator/get-scope.decorator';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) { }

  async create(createOfferDto: CreateOfferDto, creatorId: string, companyId: string) {
    // Validação de preço
    if (createOfferDto.discountPrice >= createOfferDto.originalPrice) {
      throw new BadRequestException('O preço com desconto deve ser menor que o preço original.');
    }

    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      creator: { id: creatorId },
      companyId: companyId, // Aqui usamos o companyId resolvido pelo controller/scope
    });

    try {
      return await this.offerRepository.save(newOffer);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao salvar no banco de dados.');
    }
  }

  // Substitui o findAllByCompany e o antigo findAll
  // Se scope for {}, o TypeORM ignora o filtro e traz tudo (Modo Admin)
  // Se scope for { companyId }, o TypeORM filtra automaticamente (Modo Merchant)
  async findAll(scope: QueryScope) {
    return await this.offerRepository.find({
      where: scope,
      order: { createdAt: 'DESC' },
      relations: ['creator'],
    });
  }

  async findOne(id: string, scope: QueryScope) {
    const offer = await this.offerRepository.findOne({
      where: { id, ...scope }
    });

    if (!offer) {
      throw new NotFoundException('Oferta não encontrada ou acesso negado.');
    }
    return offer;
  }

  async update(id: string, scope: QueryScope, updateOfferDto: UpdateOfferDto) {
    // A segurança está no 'where: { id, ...scope }'
    const offer = await this.findOne(id, scope);

    if (updateOfferDto.discountPrice && updateOfferDto.originalPrice) {
      if (updateOfferDto.discountPrice >= updateOfferDto.originalPrice) {
        throw new BadRequestException('O desconto deve ser menor que o preço original.');
      }
    }

    Object.assign(offer, updateOfferDto);
    return await this.offerRepository.save(offer);
  }

  async remove(id: string, scope: QueryScope) {
    const offer = await this.findOne(id, scope);
    return await this.offerRepository.remove(offer);
  }

  async countAll() {
    const total = await this.offerRepository.count();
    return {
      totalOffers: total,
      timestamp: new Date().toISOString()
    };
  }
}