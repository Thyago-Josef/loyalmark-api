import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // O 'user' foi injetado aqui pelo seu JwtAuthGuard na linha: request['user'] = payload;
        return request.user;
    },
);