// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//     constructor(
//         private jwtService: JwtService,
//         private configService: ConfigService,
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest();
//         const token = this.extractTokenFromHeader(request);

//         if (!token) {
//             throw new UnauthorizedException('Token não encontrado');
//         }

//         try {
//             const payload = await this.jwtService.verifyAsync(token, {
//                 secret: this.configService.get('JWT_SECRET'),
//             });
//             // 💡 Anexamos os dados do usuário na requisição para usar depois!
//             request['user'] = payload;
//         } catch {
//             throw new UnauthorizedException('Token inválido ou expirado');
//         }

//         return true;
//     }

//     private extractTokenFromHeader(request: any): string | undefined {
//         const [type, token] = request.headers.authorization?.split(' ') ?? [];
//         return type === 'Bearer' ? token : undefined;
//     }
// }

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core'; // 1. Importe o Reflector
import { IS_PUBLIC_KEY } from './decorators/public.decorator'; // Importe a chave do decorator que você criar

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector, // 2. Injete o Reflector aqui
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 3. Verifique se a rota tem o decorator @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Libera o acesso sem pedir token
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
