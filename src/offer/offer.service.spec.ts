import { Test, TestingModule } from '@nestjs/testing';
import { OfferService } from './offer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';

describe('OfferService', () => {
  let service: OfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        {
          //Precisamos dizer ao Nest o que usar no lugar do banco de dados real
          provide: getRepositoryToken(Offer),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            // adicione outros métodos que você usa no service
          },
        },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
