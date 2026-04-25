import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Café Central', description: 'Nome da empresa' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'cafe-central', description: 'Slug único para URL' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  slug!: string;
}
