import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: 'SUA_CHAVE_SUPER_SECRETA', // Use .env depois!
      signOptions: { expiresIn: '1d' }, // Token vale por 1 dia
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }