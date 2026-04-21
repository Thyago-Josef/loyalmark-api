import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), AuthModule,], // 👈 Adicione isso
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService], // 👈 Exporte para usar em outros módulos
})
export class CompanyModule { }
