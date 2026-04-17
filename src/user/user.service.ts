import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    // O "salt" é um tempero aleatório que torna o hash impossível de descriptografar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      // 💡 IMPORTANTE: Se você quer validar a senha no login, 
      // precisa forçar o TypeORM a trazer o campo password que marcamos com "select: false"
      select: ['id', 'email', 'password', 'name', 'role'],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
