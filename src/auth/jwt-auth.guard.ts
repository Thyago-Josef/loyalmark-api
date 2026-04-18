import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token não encontrado');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
            // 💡 Anexamos os dados do usuário na requisição para usar depois!
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