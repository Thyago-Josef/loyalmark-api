// src/common/decorators/get-scope.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

export interface QueryScope {
    companyId?: string;
}

export const GetScope = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): QueryScope => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Se você é Admin e NÃO está impersonando ninguém, o escopo é vazio (vê tudo)
        // Se você é Admin mas o token tem um companyId (Impersonate), o escopo filtra aquela loja
        if (user.role === UserRole.ADMIN && !user.companyId) {
            return {};
        }

        // Para Lojistas ou Admins em modo Impersonate
        return { companyId: user.companyId };
    },
);