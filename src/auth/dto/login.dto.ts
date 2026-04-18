// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'admin@loyalmark.com',
        description: 'Email do usuário'
    })
    @IsEmail({}, { message: 'Informe um email válido' })
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        example: 'Senha@123',
        description: 'Senha do usuário'
    })
    @IsNotEmpty()
    @MinLength(6)
    password!: string;
}