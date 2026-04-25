import { Module, forwardRef } from '@nestjs/common'; // Adicione forwardRef aqui
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';
import { CompanyModule } from '../company/company.module'; // 👈 CORRIGIDO: Aponte para o seu arquivo, não para o faker!

@Module({
  imports: [
    UserModule,
    forwardRef(() => CompanyModule), // 👈 Use forwardRef para não travar o Nest
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
