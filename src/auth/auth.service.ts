import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    // 🛡️ Validação de segurança: se não achar o user, já para aqui
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // Agora o TS sabe que o 'user' NÃO é nulo abaixo desta linha
    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}