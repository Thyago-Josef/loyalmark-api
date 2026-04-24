// No update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Criamos um tipo que é o CreateUserDto SEM o companyId e SEM o role, e então o tornamos parcial.
export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['companyId', 'role', 'password'] as const),
) { }