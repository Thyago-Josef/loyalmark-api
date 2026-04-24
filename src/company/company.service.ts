import { AuthService } from './../auth/auth.service';
import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly companyRepository: Repository<Company>, @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) { }

  async create(createCompanyDto: CreateCompanyDto) {
    const { slug } = createCompanyDto;

    // 1. Verificação de duplicidade
    const existingCompany = await this.companyRepository.findOne({
      where: { slug }
    });

    if (existingCompany) {
      // Se encontrar, barramos a criação com erro 409 (Conflict)
      throw new ConflictException(`O slug "${slug}" já está em uso por outra empresa.`);
    }

    // 2. Se passou, criamos a empresa normalmente
    const newCompany = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(newCompany);
  }

  async findAll(scope: QueryScope) {
    // Se scope for { companyId: 'uuid' }, filtra por ID. Se for {}, traz todas (Admin).
    const filter = scope.companyId ? { id: scope.companyId } : {};
    return await this.companyRepository.find({ where: filter });
  }

  async findOne(scope: QueryScope, idFromParam?: string) {
    // 1. Define o ID alvo
    const targetId = scope.companyId || idFromParam;

    // 2. Trava de segurança: Se o ID resultou em algo falso (null/undefined/vazio)
    if (!targetId) {
      // Se você quer que o Admin veja "Nada" em vez de erro, use 'return null'
      // Se quiser ser rigoroso, mantenha a Exception
      throw new NotFoundException('Nenhuma empresa selecionada ou identificada.');
    }

    // 3. Busca com a certeza de que targetId tem um valor real
    const company = await this.companyRepository.findOne({
      where: { id: targetId }
    });

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
    const company = await this.findOneRaw(id); // Garante que existe
    if (!company) throw new NotFoundException('Empresa não encontrada');

    // O softDelete apenas preenche a coluna deletedAt
    return await this.companyRepository.softDelete(id);
  }

  // Dentro do CompanyService
  // async impersonate(adminId: string, targetCompanyId: string) {
  //   const company = await this.companyRepository.findOne({ where: { id: targetCompanyId } });

  //   if (!company) {
  //     throw new NotFoundException('Empresa destino não encontrada.');
  //   }

  //   // Aqui você chama o método do seu AuthService que gera o token especial
  //   // O payload levará o ID do admin, mas o companyId da empresa alvo
  //   return this.authService.generateImpersonateToken(adminId, targetCompanyId);
  // }

  async findOneRaw(id: string) {
    return await this.companyRepository.findOne({ where: { id } });
  }



}