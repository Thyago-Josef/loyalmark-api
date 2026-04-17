import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { UserRole } from "../entities/user.entity";

export class CreateUserDto {

    @ApiProperty({
        description: 'Email do usuário',
        example: 'usuario@email.com'
    })
    @IsEmail({}, { message: 'O email informado é inválido' })
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        description: 'Senha do usuário',
        example: 'Senha@123',
        minLength: 6
    })
    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password!: string;

    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'João Silva'
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        description: 'Papel do usuário no sistema',
        enum: UserRole,
        default: UserRole.CUSTOMER
    })
    @IsEnum(UserRole)
    role!: UserRole;
}