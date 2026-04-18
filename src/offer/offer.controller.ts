import { Controller, Post, Get, Body, Param, UseGuards, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { LoginDto } from '@/auth/dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('offers') // A URL será http://localhost:3000/offers
export class OfferController {
  constructor(private readonly offerService: OfferService) { }

  @Post() // 👈 Removemos o :companyId da URL. O ID vem do Token!
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() user: User
  ) {
    // Passamos o ID do funcionário (user.id) e o ID da empresa (user.companyId)
    // Nota: Certifique-se que seu User Entity tem o campo companyId ou que ele está no JWT
    return this.offerService.create(createOfferDto, user.id, (user as any).companyId);
  }





  @Get()
  async findAll(@CurrentUser() user: User) {
    // Em um SaaS, o Get nunca retorna "tudo", apenas o que pertence à empresa do usuário
    return this.offerService.findAllByCompany((user as any).companyId);
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN) // 👈 Só você entra aqui
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getGlobalStats() {
    // Retorna quantas ofertas existem no total no sistema
    return this.offerService.countAll();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateOfferDto: UpdateOfferDto
  ) {
    return this.offerService.update(id, user.companyId, updateOfferDto);
  }
}
