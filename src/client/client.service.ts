import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCompany } from './entities/user-company.entity';
import { UserService } from '@/user/user.service';
import { OfferService } from '@/offer/offer.service';
import { CompanyService } from '@/company/company.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    private readonly userService: UserService,
    private readonly offerService: OfferService,
    private readonly companyService: CompanyService,
  ) {}

  async linkCompany(userId: string, companyId: string) {
    const company = await this.companyService.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const existing = await this.userCompanyRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
    });

    if (existing) {
      throw new ConflictException('Cliente já está vinculado a esta empresa.');
    }

    const userCompany = this.userCompanyRepository.create({
      user: { id: userId } as any,
      company: { id: companyId } as any,
    });

    return this.userCompanyRepository.save(userCompany);
  }

  async unlinkCompany(userId: string, companyId: string) {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
    });

    if (!userCompany) {
      throw new NotFoundException('Vínculo não encontrado.');
    }

    return this.userCompanyRepository.remove(userCompany);
  }

  async getLinkedCompanies(userId: string) {
    const links = await this.userCompanyRepository.find({
      where: { user: { id: userId } },
      relations: ['company'],
    });

    return links.map((link) => link.company);
  }

  async accessCompany(userId: string, companyId: string) {
    const linked = await this.userCompanyRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
    });

    if (!linked) {
      throw new NotFoundException('Cliente não está vinculado a esta empresa.');
    }

    const company = await this.companyService.findById(companyId);
    return {
      company,
      accessToken: this.generateAccessToken(userId, companyId),
    };
  }

  async getOffersForCompany(userId: string, companyId: string) {
    const linked = await this.userCompanyRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
    });

    if (!linked) {
      throw new NotFoundException('Cliente não está vinculado a esta empresa.');
    }

    return this.offerService.findAllForCompany(companyId);
  }

  async getPublicOffers() {
    return this.offerService.findAllPublic();
  }

  async getOffersForUser(userId: string) {
    const links = await this.userCompanyRepository.find({
      where: { user: { id: userId } },
    });

    const companyIds = links.map((link) => (link.company as any).id);
    return this.offerService.findAllForCompanies(companyIds);
  }

  private generateAccessToken(userId: string, companyId: string): string {
    return Buffer.from(`${userId}:${companyId}`).toString('base64');
  }
}