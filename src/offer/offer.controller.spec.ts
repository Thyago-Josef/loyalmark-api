import { Test, TestingModule } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



describe('OfferController', () => {
  let controller: OfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        {
          provide: OfferService,
          useValue: { findAll: jest.fn(), create: jest.fn() },
        },
      ],
    })
      // 💡 Isso aqui "desliga" o Guard durante o teste unitário
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OfferController>(OfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
