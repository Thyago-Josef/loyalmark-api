// src/common/decorators/get-scope.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

// No seu arquivo de tipos ou no decorator
export interface QueryScope {
  companyId?: string;
  userId: string;
  role: UserRole; // <--- Mude de string para UserRole
}

export const GetScope = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): QueryScope => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Dados vindos do seu JwtAuthGuard customizado

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // 2. SEMPRE retorne o objeto completo para satisfazer a interface QueryScope
    return {
      // Use o nome do campo exatamente como você colocou no payload do seu login (id ou sub)
      userId: user.id || user.sub,
      role: user.role as UserRole,
      // Se não houver companyId (Admin Master), ele será undefined, o que a interface aceita
      companyId: user.companyId || undefined,
    };
  },
);
