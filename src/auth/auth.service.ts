import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@/user/entities/user.entity';
import { CompanyService } from '@/company/company.service';



@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
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
      companyId: user.role === 'admin' ? null : user.companyId
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }



  async impersonate(adminId: string, targetCompanyId: string) {
    // 1. Validar se a empresa alvo existe no banco
    const company = await this.companyService.findOneRaw(targetCompanyId);
    if (!company) {
      throw new NotFoundException('A empresa destino não existe.');
    }

    // 2. Buscar e validar se o usuário solicitante é realmente um ADMIN
    // Usamos findById que criamos para ignorar filtros de escopo
    const admin = await this.userService.findById(adminId);
    if (admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores master podem realizar esta ação.');
    }

    // 3. Montagem do Payload "Disfarçado"
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      companyId: targetCompanyId, // Aqui injetamos o ID da empresa alvo
      isImpersonating: true,       // Para o Front-end saber que deve mostrar um aviso
    };

    // 4. Retorno padronizado
    return {
      access_token: await this.jwtService.signAsync(payload),
      targetCompanyName: company.name, // Útil para o front exibir: "Logado como: Empresa X"
    };
  }
}




//   async generateImpersonateToken(adminId: string, targetCompanyId: string) {
//     // Buscamos os dados do Admin para garantir que o payload tenha informações reais
//     // const admin = await this.userService.findOne(adminId, {}); // {} pois admin vê tudo

//     const admin = await this.userService.findById(adminId);

//     const payload = {
//       sub: admin.id,
//       email: admin.email, // Importante para o Front saber quem está logado
//       companyId: targetCompanyId, // A "mágica": trocamos a empresa do contexto
//       role: UserRole.ADMIN,
//       isImpersonating: true, // Flag para o Frontend ativar a "barra de aviso"
//     };

//     return {
//       access_token: await this.jwtService.signAsync(payload),
//       message: `Acesso administrativo concedido para a empresa ${targetCompanyId}`,
//     };
//   }


//   async impersonate(adminId: string, targetCompanyId: string) {
//     // 1. Validar se a empresa alvo existe
//     const company = await this.companyService.findOneRaw(targetCompanyId);
//     if (!company) throw new NotFoundException('Empresa não encontrada');

//     // 2. Buscar os dados do admin para garantir que ele ainda é admin
//     const admin = await this.userService.findById(adminId);
//     if (admin.role !== UserRole.ADMIN) {
//       throw new ForbiddenException('Apenas admins podem realizar impersonate');
//     }

//     // 3. Gerar o payload com o ID da empresa alvo
//     const payload = {
//       sub: admin.id,
//       email: admin.email,
//       role: admin.role,
//       companyId: targetCompanyId, // Aqui injetamos o ID da empresa do cliente
//       isImpersonating: true       // Flag útil para auditoria e logs
//     };

//     return {
//       access_token: await this.jwtService.signAsync(payload),
//     };
//   }
// }
