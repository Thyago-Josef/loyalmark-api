import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { QueryScope } from '../common/decorator/get-scope.decorator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto, companyId?: string) {
    const { password, ...userData } = createUserDto;

    // 1. A Trava de Segurança
    const isMasterAdmin = createUserDto.role === UserRole.ADMIN;
    if (!isMasterAdmin && !companyId) {
      throw new BadRequestException('Usuários não-admin devem pertencer a uma empresa.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Montando o objeto com tipagem explícita para evitar erros de Overload
    const userPayload: DeepPartial<User> = {
      ...userData,
      password: hashedPassword,
      // Se não for admin, passamos o objeto da empresa. 
      // Se for admin, deixamos undefined (o TypeORM salvará NULL no banco)
      company: !isMasterAdmin ? { id: companyId } : undefined,
      companyId: !isMasterAdmin ? companyId : undefined,
    };

    const newUser = this.userRepository.create(userPayload);
    return await this.userRepository.save(newUser);
  }
  async findAll(scope: QueryScope) {
    return await this.userRepository.find({
      where: scope, // Filtra por companyId ou nada (se Admin)
      relations: ['company'],
    });
  }

  async findOne(id: string, scope: QueryScope) {
    const user = await this.userRepository.findOne({
      where: { id, ...scope }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'companyId'], // Adicionei companyId aqui para o JWT
    });
  }

  async update(id: string, scope: QueryScope, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id, scope);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string, scope: QueryScope) {
    const user = await this.findOne(id, scope);
    return await this.userRepository.remove(user);
  }
}