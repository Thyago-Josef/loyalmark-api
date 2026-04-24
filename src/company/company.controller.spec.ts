import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { AuthService } from '../auth/auth.service'; // 1. Importe o AuthService
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('CompanyController', () => {
  let controller: CompanyController;

  const mockCompanyService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    // impersonate saiu daqui...
  };

  // 2. Crie o mock para o AuthService
  const mockAuthService = {
    impersonate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        { provide: CompanyService, useValue: mockCompanyService },
        { provide: AuthService, useValue: mockAuthService }, // 3. Forneça o AuthService aqui
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});