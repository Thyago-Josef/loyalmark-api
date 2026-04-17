import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsBoolean, Min, MinLength } from 'class-validator';

export class CreateOfferDto {
    @ApiProperty({ description: 'Título da oferta comercial', example: 'Hambúrguer Artesanal 20% OFF' })
    @IsString()
    @MinLength(3)
    title!: string;

    @ApiProperty({ description: 'Preço original do produto', example: 45.90 })
    @IsNumber()
    @Min(0.01)
    originalPrice!: number;

    @ApiProperty({ description: 'Preço com desconto aplicado', example: 36.70 })
    @IsNumber()
    @Min(0)
    discountPrice!: number;

    @ApiProperty({ description: 'Quantidade total de cupons disponíveis', example: 100 })
    @IsNumber()
    @Min(1)
    couponLimit!: number;

    @ApiProperty({ description: 'Data de expiração (ISO8601)', example: '2026-12-31T23:59:59Z' })
    @IsDateString()
    expiresAt!: string;

    @ApiProperty({ description: 'Define se a oferta é apenas para clientes VIP', example: false })
    @IsBoolean()
    isPremium!: boolean;
}