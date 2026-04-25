import { Controller, Get, Post, Delete, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/user/entities/user.entity';
import { Public } from '@/auth/decorators/public.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Client')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Public()
  @Get('offers/public')
  @ApiOperation({ summary: 'Vitrine pública - todas as ofertas' })
  @ApiOkResponse({ description: 'Lista de ofertas de todas as empresas.' })
  async getPublicOffers() {
    return this.clientService.getPublicOffers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('companies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista empresas vinculadas ao cliente' })
  @ApiOkResponse({ description: 'Lista de empresas vinculadas.' })
  async getMyCompanies(@CurrentUser() user: any) {
    return this.clientService.getLinkedCompanies((user as any).sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('companies/:companyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vincular empresa ao cliente' })
  @ApiOkResponse({ description: 'Empresa vinculada com sucesso.' })
  async linkCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.clientService.linkCompany((user as any).sub, companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Delete('companies/:companyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desvincular empresa do cliente' })
  @ApiOkResponse({ description: 'Empresa desvinculada com sucesso.' })
  async unlinkCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.clientService.unlinkCompany((user as any).sub, companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('access/:companyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Acessar contexto de uma empresa' })
  @ApiOkResponse({ description: 'Token de acesso gerado.' })
  async accessCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.clientService.accessCompany((user as any).sub, companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('offers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Todas as ofertas das empresas vinculadas' })
  @ApiOkResponse({ description: 'Lista de ofertas.' })
  async getMyOffers(@CurrentUser() user: any) {
    return this.clientService.getOffersForUser((user as any).sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('offers/:companyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ofertas de uma empresa específica' })
  @ApiOkResponse({ description: 'Lista de ofertas da empresa.' })
  async getOffersByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.clientService.getOffersForCompany((user as any).sub, companyId);
  }
}