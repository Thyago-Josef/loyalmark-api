import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  private getWhereFilter(id: string | null, scope: QueryScope) {
    const filter: any = {};
    if (id) filter.id = id;
    if (scope.companyId) filter.companyId = scope.companyId;
    return filter;
  }

  async create(
    createOfferDto: CreateOfferDto,
    creatorId: string,
    companyId: string,
  ) {
    if (createOfferDto.discountPrice >= createOfferDto.originalPrice) {
      throw new BadRequestException(
        'O preço com desconto deve ser menor que o preço original.',
      );
    }

    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      creatorId: creatorId,
      companyId: companyId,
    });

    try {
      return await this.offerRepository.save(newOffer);
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao salvar no banco de dados.',
      );
    }
  }

  // Substitui o findAllByCompany e o antigo findAll
  // Se scope for {}, o TypeORM ignora o filtro e traz tudo (Modo Admin)
  // Se scope for { companyId }, o TypeORM filtra automaticamente (Modo Merchant)
  // async findAll(scope: QueryScope) {
  //   return await this.offerRepository.find({
  //     where: scope,
  //     order: { createdAt: 'DESC' },
  //     relations: ['creator'],
  //   });
  // }

  // async findAll(scope: QueryScope) {
  //   // Criamos um filtro limpo
  //   const whereFilter: any = {};

  //   // Se houver companyId no scope, filtramos por ele (Multi-tenant)
  //   // Se não houver (Admin Master sem impersonate), whereFilter fica vazio e traz tudo
  //   if (scope.companyId) {
  //     whereFilter.companyId = scope.companyId;
  //   }

  //   // IMPORTANTE: Não passamos o scope.userId para cá, pois Offer não tem essa coluna!

  //   return await this.offerRepository.find({
  //     where: whereFilter, // Usamos o filtro limpo, sem o userId intruso
  //     order: { createdAt: 'DESC' },
  //     relations: ['creator'],
  //   });
  // }

  async findAll(scope: QueryScope) {
    const where = this.getWhereFilter(null, scope);
    return await this.offerRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['creator'],
    });
  }

  async findOne(id: string, scope: QueryScope) {
    // Aqui estava o erro! Usando o filtro limpo:
    const where = this.getWhereFilter(id, scope);

    const offer = await this.offerRepository.findOne({ where });

    if (!offer) {
      throw new NotFoundException('Oferta não encontrada ou acesso negado.');
    }
    return offer;
  }

  async update(id: string, scope: QueryScope, updateOfferDto: UpdateOfferDto) {
    // findOne agora já usa o filtro limpo, então o update fica seguro
    const offer = await this.findOne(id, scope);

    if (updateOfferDto.discountPrice && updateOfferDto.originalPrice) {
      if (updateOfferDto.discountPrice >= updateOfferDto.originalPrice) {
        throw new BadRequestException(
          'O desconto deve ser menor que o preço original.',
        );
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
      timestamp: new Date().toISOString(),
    };
  }

  async findAllPublic() {
    return await this.offerRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['creator', 'company'],
    });
  }

  async findAllForCompany(companyId: string) {
    return await this.offerRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      relations: ['creator'],
    });
  }

  async findAllForCompanies(companyIds: string[]) {
    if (companyIds.length === 0) {
      return [];
    }
    return await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.companyId IN (:...companyIds)', { companyIds })
      .orderBy('offer.createdAt', 'DESC')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('offer.creator', 'creator')
      .getMany();
  }

  async getPublicOffers() {
    return this.findAllPublic();
  }
}
