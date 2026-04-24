import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CompanyService } from '@/company/company.service'; // Importe aqui

describe('AuthService', () => {
  let service: AuthService;

  // 1. Criamos os mocks para todas as dependências
  const mockUserService = {
    findOneByEmail: jest.fn(),
    findById: jest.fn(), // Adicionado porque o impersonate usa este
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockCompanyService = {
    findOneRaw: jest.fn(), // Adicionado porque o impersonate usa este
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        // 2. Adicione o CompanyService aqui!
        {
          provide: CompanyService,
          useValue: mockCompanyService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});