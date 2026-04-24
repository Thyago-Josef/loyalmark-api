import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse
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
  constructor(private readonly userService: UserService) { }

  // @Post()
  // @ApiOperation({
  //   summary: 'Criar usuário/funcionário',
  //   description: 'Cria um novo usuário vinculado à empresa do criador. Se o criador for ADMIN, ele pode especificar a empresa alvo no DTO.'
  // })
  // @ApiCreatedResponse({ description: 'Usuário criado com sucesso.' })
  // @ApiBadRequestResponse({ description: 'Dados inválidos ou e-mail já cadastrado.' })
  // @ApiForbiddenResponse({ description: 'Você não tem permissão para criar usuários para esta empresa.' })
  // async create(
  //   @Body() createUserDto: CreateUserDto,
  //   @CurrentUser() currentUser: User,
  //   @GetScope() scope: QueryScope
  // ) {
  //   const companyId = scope.companyId || createUserDto.companyId || (currentUser as any).companyId;
  //   return this.userService.create(createUserDto, companyId);
  // }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
    @GetScope() scope: QueryScope
  ) {
    let companyId: string;

    if (currentUser.role === UserRole.ADMIN) {
      // Se for ADMIN, ele pode escolher:
      // 1. O ID do Impersonate (scope)
      // 2. Ou o ID enviado manualmente no DTO
      companyId = scope.companyId || createUserDto.companyId;
    } else {
      // Se NÃO for admin, ignoramos o DTO por segurança!
      // Ele SÓ pode criar usuários para a própria empresa dele.
      companyId = (currentUser as any).companyId;
    }

    // Trava final: se ninguém tem empresa, barramos.
    if (!companyId && createUserDto.role !== UserRole.ADMIN) {
      throw new BadRequestException('Não foi possível identificar a empresa para este usuário.');
    }

    return this.userService.create(createUserDto, companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description: 'Retorna os usuários conforme o nível de acesso: Admin visualiza todos do sistema, Lojista visualiza apenas sua equipe.'
  })
  @ApiOkResponse({ description: 'Lista de usuários retornada com sucesso.' })
  async findAll(@GetScope() scope: QueryScope) {
    return this.userService.findAll(scope);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um usuário específico',
    description: 'Retorna os dados de um usuário pelo ID, desde que ele pertença ao seu escopo (empresa).'
  })
  @ApiOkResponse({ description: 'Usuário encontrado.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado ou fora do seu escopo de acesso.' })
  async findOne(@Param('id') id: string, @GetScope() scope: QueryScope) {
    return this.userService.findOne(id, scope);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza informações do usuário. Se a senha for enviada, ela será criptografada novamente.'
  })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado para atualização.' })
  @ApiBadRequestResponse({ description: 'Erro na validação dos dados enviados.' })
  async update(
    @Param('id') id: string,
    @GetScope() scope: QueryScope,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, scope, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Remover usuário',
    description: 'Remove um usuário permanentemente do sistema. Apenas usuários com privilégios de ADMIN podem executar esta ação.'
  })
  @ApiOkResponse({ description: 'Usuário removido com sucesso.' })
  @ApiForbiddenResponse({ description: 'Acesso negado: apenas administradores podem deletar usuários.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  async remove(@Param('id') id: string, @GetScope() scope: QueryScope) {
    return this.userService.remove(id, scope);
  }
}