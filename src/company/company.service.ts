import { AuthService } from './../auth/auth.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryScope } from '../common/decorator/get-scope.decorator';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>, private readonly authService: AuthService,
  ) { }

  async create(createCompanyDto: CreateCompanyDto) {
    const company = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(company);
  }

  async findAll(scope: QueryScope) {
    // Se scope for { companyId: 'uuid' }, filtra por ID. Se for {}, traz todas (Admin).
    const filter = scope.companyId ? { id: scope.companyId } : {};
    return await this.companyRepository.find({ where: filter });
  }

  async findOne(scope: QueryScope, idFromParam?: string) {
    // A prioridade de busca é sempre o ID do escopo (segurança)
    const targetId = scope.companyId || idFromParam;

    const company = await this.companyRepository.findOne({ where: { id: targetId } });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada ou acesso negado.');
    }
    return company;
  }

  async update(id: string, scope: QueryScope, updateCompanyDto: UpdateCompanyDto) {
    // Busca garantindo que o usuário tem acesso a esse ID
    const company = await this.findOne(scope, id);

    Object.assign(company, updateCompanyDto);
    return await this.companyRepository.save(company);
  }

  async remove(id: string) {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return await this.companyRepository.remove(company);
  }

  // Dentro do CompanyService
  async impersonate(adminId: string, targetCompanyId: string) {
    const company = await this.companyRepository.findOne({ where: { id: targetCompanyId } });

    if (!company) {
      throw new NotFoundException('Empresa destino não encontrada.');
    }

    // Aqui você chama o método do seu AuthService que gera o token especial
    // O payload levará o ID do admin, mas o companyId da empresa alvo
    return this.authService.generateImpersonateToken(adminId, targetCompanyId);
  }
}