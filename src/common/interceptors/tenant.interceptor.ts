// src/common/interceptors/tenant.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.companyId) {
            // Injetamos o tenantId no cabeçalho ou no objeto da requisição
            request.tenantId = user.companyId;
        }

        return next.handle();
    }
}