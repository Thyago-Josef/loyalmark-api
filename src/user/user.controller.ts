import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';
import { GetScope } from '../common/decorator/get-scope.decorator';
import type { QueryScope } from '../common/decorator/get-scope.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Criar usuário/funcionário',
    description: 'Cria um novo usuário vinculado à empresa. ADMIN e MERCHANT podem criar.',
  })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso.' })
  @ApiForbiddenResponse({ description: 'Apenas ADMIN ou MERCHANT podem criar usuários.' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
    @GetScope() scope: QueryScope,
  ) {
    let companyId: string;

    if (currentUser.role === UserRole.ADMIN) {
      companyId = scope.companyId || createUserDto.companyId;
    } else {
      companyId = (currentUser as any).companyId;
    }

    if (!companyId && createUserDto.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Não foi possível identificar a empresa para este usuário.',
      );
    }

    return this.userService.create(createUserDto, companyId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Listar usuários',
    description: 'ADMIN vê todos, MERCHANT vê apenas usuários da empresa.',
  })
  @ApiOkResponse({ description: 'Lista de usuários retornada com sucesso.' })
  async findAll(@GetScope() scope: QueryScope) {
    return this.userService.findAll(scope);
  }

  @Get('me')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Meu perfil',
    description: 'Retorna os dados do próprio usuário logado.',
  })
  @ApiOkResponse({ description: 'Dados do usuário retornados com sucesso.' })
  async getMe(@CurrentUser() user: User) {
    return this.userService.findById((user as any).sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Buscar um usuário específico',
    description: 'ADMIN e MERCHANT podem buscar usuários.',
  })
  @ApiOkResponse({ description: 'Usuário encontrado.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  async findOne(@Param('id') id: string, @GetScope() scope: QueryScope) {
    return this.userService.findOne(id, scope);
  }

  @Patch('me')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Atualizar meu perfil',
    description: 'Qualquer usuário pode atualizar seus próprios dados.',
  })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso.' })
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateMe((user as any).sub, updateUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'ADMIN e MERCHANT podem atualizar usuários.',
  })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  async update(
    @Param('id') id: string,
    @GetScope() scope: QueryScope,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, scope, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Remover usuário',
    description: 'Apenas ADMIN pode deletar usuários.',
  })
  @ApiOkResponse({ description: 'Usuário removido com sucesso.' })
  @ApiForbiddenResponse({ description: 'Apenas ADMIN pode deletar usuários.' })
  async remove(@Param('id') id: string, @GetScope() scope: QueryScope) {
    return this.userService.remove(id, scope);
  }
}