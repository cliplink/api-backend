import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { UserEntity } from '../../../users/dao/user.entity';

type RequiredUserParams = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;

const getDefaultParam = (): RequiredUserParams => {
  return {
    email: faker.internet.email(),
    passwordHash: faker.string.sample(64),
  };
};

export async function userFactory(
  moduleFixture: TestingModule,
  param: Partial<UserEntity> = {},
): Promise<UserEntity> {
  const userParam: Partial<UserEntity> & RequiredUserParams = {
    ...getDefaultParam(),
    ...param,
  };

  const userRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));

  return userRepository.save(userParam);
}
