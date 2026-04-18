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

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    // 1. Busca o usuário pelo email
    const user = await this.userService.findOneByEmail(email);

    // 2. Validação: se o usuário não existir ou a senha não bater
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Montagem do Payload do "Mestre" ou "Lojista"
    // O companyId aqui é o que garante o Multi-tenancy que configuramos
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
