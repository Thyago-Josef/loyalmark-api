import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  private getWhereFilter(id: string | null, scope: QueryScope) {
    const filter: any = {};

    if (id) filter.id = id;

    // Se houver um companyId no escopo (Merchant ou Admin em Impersonate), filtra.
    // Se for Admin Master puro (companyId é null), o filtro fica vazio e traz tudo.
    if (scope.companyId) {
      filter.companyId = scope.companyId;
    }
    return filter;
  }

  async create(createUserDto: CreateUserDto, companyId?: string) {
    const { password, ...userData } = createUserDto;

    // 1. A Trava de Segurança
    const isMasterAdmin = createUserDto.role === UserRole.ADMIN;
    if (!isMasterAdmin && !companyId) {
      throw new BadRequestException(
        'Usuários não-admin devem pertencer a uma empresa.',
      );
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
    const where = this.getWhereFilter(null, scope);

    return await this.userRepository.find({
      where,
      relations: ['company'],
    });
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
  async findOne(id: string, scope: QueryScope) {
    const where = this.getWhereFilter(id, scope);

    const user = await this.userRepository.findOne({ where });

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

    // Agora extraímos TUDO o que é sensível
    const { password, companyId, role, email, ...dataToUpdate } =
      updateUserDto as any;

    // OPCIONAL: Se você decidir que o e-mail também é sensível
    // (ex: precisa de confirmação), você o extrai acima também.

    // O Object.assign agora só mexe em campos "inofensivos" como Nome.
    Object.assign(user, dataToUpdate);

    return await this.userRepository.save(user);
  }

  async remove(id: string, scope: QueryScope) {
    const user = await this.findOne(id, scope);
    return await this.userRepository.remove(user);
  }

  // No seu service
  async findSomething(scope: QueryScope) {
    return this.userRepository.find({
      where: {
        companyId: scope.companyId,
      },
    });
  }

  async updateMe(id: string, updateUserDto: any) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    } else {
      delete updateUserDto.password;
    }

    delete updateUserDto.role;
    delete updateUserDto.companyId;
    delete updateUserDto.email;

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}
