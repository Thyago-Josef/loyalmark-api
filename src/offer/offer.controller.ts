import { Controller, Post, Get, Body, Param, UseGuards, Patch, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { GetScope } from '../common/decorator/get-scope.decorator';
import type { QueryScope } from '../common/decorator/get-scope.decorator';

@UseGuards(JwtAuthGuard)
@ApiTags('Offers')
@ApiBearerAuth('access-token')
@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) { }

  @Post()
  @ApiOperation({
    summary: 'Cria uma nova oferta',
    description: 'Registra uma oferta vinculada automaticamente à empresa do usuário logado. Se for ADMIN, herda sua própria empresa ou a definida no contexto.'
  })
  @ApiCreatedResponse({ description: 'Oferta criada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Preço de desconto inválido ou dados da oferta incompletos.' })
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() user: User,
    @GetScope() scope: QueryScope
  ) {
    const companyId = scope.companyId || (user as any).companyId;
    return this.offerService.create(createOfferDto, user.id, companyId);
  }


  //  -------  >  criamos uma rota exclusiva para o Admin: POST /company/:id/impersonate.

  @Get()
  @ApiOperation({
    summary: 'Lista ofertas (Multi-tenant)',
    description: 'Retorna a lista de ofertas. O Master (ADMIN) visualiza TODAS as ofertas do sistema, enquanto Lojistas visualizam apenas as ofertas de sua própria empresa.'
  })
  @ApiOkResponse({ description: 'Lista de ofertas retornada com sucesso conforme o escopo de acesso.' })
  async findAll(@GetScope() scope: QueryScope) {
    return this.offerService.findAll(scope);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhes de uma oferta',
    description: 'Busca uma oferta específica pelo ID, respeitando o isolamento de empresa (Multi-tenant).'
  })
  @ApiOkResponse({ description: 'Dados da oferta retornados com sucesso.' })
  @ApiNotFoundResponse({ description: 'Oferta não encontrada ou pertence a outra empresa.' })
  async findOne(@Param('id') id: string, @GetScope() scope: QueryScope) {
    return this.offerService.findOne(id, scope);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza uma oferta',
    description: 'Permite editar os campos de uma oferta. O sistema valida se o usuário tem permissão para editar este registro específico dentro do seu escopo.'
  })
  @ApiOkResponse({ description: 'Oferta atualizada com sucesso.' })
  @ApiForbiddenResponse({ description: 'Acesso negado: você não tem permissão para editar esta oferta.' })
  @ApiNotFoundResponse({ description: 'Oferta não localizada para atualização.' })
  async update(
    @Param('id') id: string,
    @GetScope() scope: QueryScope,
    @Body() updateOfferDto: UpdateOfferDto
  ) {
    return this.offerService.update(id, scope, updateOfferDto);
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Estatísticas Globais do Master',
    description: 'Painel administrativo exclusivo para o dono do SaaS. Retorna a contagem total de todas as ofertas cadastradas na plataforma.'
  })
  @ApiOkResponse({ description: 'Estatísticas globais calculadas com sucesso.' })
  @ApiForbiddenResponse({ description: 'Acesso negado: apenas o administrador master pode visualizar estatísticas globais.' })
  async getGlobalStats() {
    return this.offerService.countAll();
  }
}