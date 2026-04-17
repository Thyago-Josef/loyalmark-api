import { Test, TestingModule } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { describe, beforeEach, it } from 'node:test';

describe('OfferController', () => {
  let controller: OfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        OfferService,
        {
          // 💡 Aqui está o segredo: Estamos criando um dublê do banco de dados
          provide: getRepositoryToken(Offer),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OfferController>(OfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
