import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) { }


  private getCriteria(companyId: string, otherFilters = {}) {
    return {
      where: { ...otherFilters, companyId },
    };
  }




  async create(createOfferDto: CreateOfferDto, creatorId: string, companyId: string) {
    // 1. Regra de Negócio: Desconto coerente
    if (createOfferDto.discountPrice >= createOfferDto.originalPrice) {
      throw new BadRequestException('O preço com desconto deve ser menor que o preço original.');
    }

    // 2. Criação da instância usando os nomes REAIS da sua Entity (creator e companyId)
    const newOffer = this.offerRepository.create({
      ...createOfferDto,
      creator: { id: creatorId }, // Vincula ao funcionário logado
      companyId: companyId,       // Vincula ao "Tenant" (Empresa dona dos dados)
    });

    try {
      return await this.offerRepository.save(newOffer);
    } catch (error) {
      console.error('Erro ao salvar oferta:', error);
      throw new InternalServerErrorException('Erro ao salvar no banco de dados.');
    }
  }

  // 3. Listagem com isolamento total de Tenant (Empresa)
  async findAllByCompany(companyId: string) {
    return await this.offerRepository.find({
      // Aqui garantimos que uma empresa NUNCA veja ofertas da outra
      where: { companyId: companyId },
      order: { createdAt: 'DESC' },
      relations: ['creator'], // Opcional: traz os dados do funcionário que criou
    });
  }


  // src/offer/offer.service.ts

  async update(id: string, companyId: string, updateOfferDto: UpdateOfferDto) {
    // Buscamos a oferta garantindo que ela pertence ao tenant (companyId)
    const offer = await this.offerRepository.findOne({
      where: { id, companyId }
    });

    if (!offer) {
      // Se o ID existir mas for de outra empresa, retornamos 404 por segurança
      // Assim não confirmamos nem que a oferta existe para quem não deve ver
      throw new NotFoundException('Oferta não encontrada ou sem permissão para editar.');
    }

    // Se houver regra de preço no update também, validamos:
    if (updateOfferDto.discountPrice && updateOfferDto.originalPrice) {
      if (updateOfferDto.discountPrice >= updateOfferDto.originalPrice) {
        throw new BadRequestException('O desconto deve ser menor que o preço original.');
      }
    }

    // Mesclamos os dados novos e salvamos
    Object.assign(offer, updateOfferDto);
    return await this.offerRepository.save(offer);
  }


  async findAll(user: User) {
    // Se for Master (ADMIN), traz TUDO de todos os lojistas
    if (user.role === UserRole.ADMIN) {
      return await this.offerRepository.find({ relations: ['creator'] });
    }

    // Se for lojista, traz apenas o dele
    return await this.offerRepository.find({
      where: { companyId: user.companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string) {
    const offer = await this.offerRepository.findOne(this.getCriteria(companyId, { id }));
    if (!offer) throw new NotFoundException('Oferta não encontrada neste lojista');
    return offer;
  }

  // src/offer/offer.service.ts

  async countAll() {
    // O TypeORM tem o método count() que retorna o total de registros na tabela
    const total = await this.offerRepository.count();

    return {
      totalOffers: total,
      timestamp: new Date().toISOString()
    };
  }
}