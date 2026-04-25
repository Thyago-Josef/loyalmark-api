import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { GetScope } from '@/common/decorator/get-scope.decorator';
import { UserRole } from '@/user/entities/user.entity';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import type { QueryScope } from '@/common/decorator/get-scope.decorator';
import { Throttle } from '@nestjs/throttler';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@ApiBearerAuth() // 👈 ESSENCIAL: Adicione aqui para habilitar o cadeado no Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza o login e retorna o token JWT' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @Post('impersonate/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin assume a identidade de uma empresa' })
  // O @ApiBearerAuth() aqui em cima é opcional se já estiver no topo da classe
  async impersonate(
    @GetScope() scope: QueryScope,
    @Param('companyId') targetCompanyId: string,
  ) {
    return this.authService.impersonate(scope.userId, targetCompanyId);
  }
}

// @ApiTags('auth') // Para organizar no Swagger
// @ApiBearerAuth()
// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) { }

//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Realiza o login e retorna o token JWT' })
//   @Throttle({ default: { limit: 5, ttl: 60000 } }) // Limite de segurança
//   @Post('login')
//   async signIn(@Body() loginDto: LoginDto) {
//     return this.authService.signIn(loginDto.email, loginDto.password);
//   }

//   // src/auth/auth.controller.ts

//   @Post('impersonate/:companyId')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.ADMIN) // Só quem já é Admin pode pedir um token de impersonate
//   @ApiBearerAuth()
//   async impersonate(
//     @GetScope() scope: QueryScope,
//     @Param('companyId') targetCompanyId: string
//   ) {
//     // O adminId vem do token atual do Admin
//     return this.authService.impersonate(scope.userId, targetCompanyId);
//   }
