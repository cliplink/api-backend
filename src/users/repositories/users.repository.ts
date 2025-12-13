import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { UserEntity } from '../dao/user.entity';

interface UserFilter {
  email?: string;
}

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public async findOne(filter: UserFilter): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: this.toWhere(filter) });
  }

  public async create(data: DeepPartial<UserEntity>): Promise<UserEntity> {
    return this.usersRepository.save(data);
  }

  private toWhere(filter: UserFilter): FindOptionsWhere<UserEntity> {
    return {
      email: filter.email,
    };
  }
}
