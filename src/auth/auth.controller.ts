import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth') // Para organizar no Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }


  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Realiza o login e retorna o token JWT' })
  // 💡 Trocamos para LoginDto aqui:
  async signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }
}