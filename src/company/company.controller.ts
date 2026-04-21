import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { GetScope } from '../common/decorator/get-scope.decorator';
import type { QueryScope } from '../common/decorator/get-scope.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { RolesGuard } from '@/auth/roles.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Companies')
@ApiBearerAuth('access-token')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Cadastrar nova empresa',
    description: 'Apenas o Administrador Master pode criar novas empresas no sistema.'
  })
  @ApiCreatedResponse({ description: 'Empresa cadastrada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos (ex: CNPJ duplicado ou inválido).' })
  @ApiForbiddenResponse({ description: 'Acesso negado: apenas o Master ADMIN pode criar empresas.' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar empresas',
    description: 'Retorna todas as empresas se for ADMIN, ou apenas a empresa do usuário logado se for MERCHANT.'
  })
  @ApiOkResponse({ description: 'Lista de empresas retornada conforme o escopo do usuário.' })
  findAll(@GetScope() scope: QueryScope) {
    return this.companyService.findAll(scope);
  }

  @Get('my-company')
  @ApiOperation({
    summary: 'Ver dados da minha empresa',
    description: 'Retorna os dados detalhados da empresa vinculada ao usuário logado.'
  })
  @ApiOkResponse({ description: 'Dados da empresa retornados com sucesso.' })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada para o usuário atual.' })
  findMyCompany(@GetScope() scope: QueryScope) {
    return this.companyService.findOne(scope);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar empresa',
    description: 'Atualiza os dados cadastrais da empresa. O sistema valida se o usuário logado tem permissão sobre o ID informado via parâmetro ou escopo.'
  })
  @ApiOkResponse({ description: 'Dados da empresa atualizados com sucesso.' })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada ou você não tem permissão para editá-la.' })
  @ApiBadRequestResponse({ description: 'Erro na validação dos campos enviados.' })
  update(
    @Param('id') id: string,
    @GetScope() scope: QueryScope,
    @Body() updateCompanyDto: UpdateCompanyDto
  ) {
    return this.companyService.update(id, scope, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Remover empresa',
    description: 'Remove permanentemente a empresa e todos os seus dados vinculados. Ação restrita ao Administrador Master.'
  })
  @ApiOkResponse({ description: 'Empresa removida com sucesso.' })
  @ApiForbiddenResponse({ description: 'Acesso negado: apenas administradores master podem remover empresas.' })
  @ApiNotFoundResponse({ description: 'ID da empresa não localizado.' })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @Post(':id/impersonate')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Acessar como Lojista (Impersonate)',
    description: 'Gera um novo token onde o ADMIN assume o contexto de uma empresa específica para suporte.'
  })
  @ApiOkResponse({ description: 'Token de impersonate gerado com sucesso.' })
  @ApiForbiddenResponse({ description: 'Apenas administradores master podem usar esta função.' })
  async impersonate(
    @Param('id') targetCompanyId: string,
    @CurrentUser() admin: User
  ) {
    // Chamamos o service para gerar o novo token com o "corpo" da empresa alvo
    return this.companyService.impersonate(admin.id, targetCompanyId);
  }
}