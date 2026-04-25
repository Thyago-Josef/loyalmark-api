import { Controller, Get } from '@nestjs/common';
import { OfferService } from './offer.service';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Offers - Public')
@Controller('offers')
export class OfferPublicController {
  constructor(private readonly offerService: OfferService) {}

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Vitrine pública',
    description:
      'Retorna todas as ofertas de todas as empresas (sem necessidade de login).',
  })
  @ApiOkResponse({ description: 'Lista de ofertas retornada com sucesso.' })
  async findPublicOffers() {
    return this.offerService.findAllPublic();
  }
}
