import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PASSWORD_SALT } from '../constants';
import { UserEntity } from '../dao/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ email });
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    return await this.usersRepository.create({
      ...data,
      passwordHash: await bcrypt.hash(data.password, PASSWORD_SALT),
    });
  }
}
