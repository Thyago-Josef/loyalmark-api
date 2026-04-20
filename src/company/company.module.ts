import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])], // 👈 Adicione isso
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService], // 👈 Exporte para usar em outros módulos
})
export class CompanyModule { }
