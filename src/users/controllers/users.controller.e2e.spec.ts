import { Server } from 'node:http';

import { faker } from '@faker-js/faker';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { type Repository } from 'typeorm';

import { clearTables } from '../../_common/utils/tests/clear-tables';
import { createTestingAppAndHttpServer } from '../../_common/utils/tests/create-testing-app-and-http-server';
import { getRepository } from '../../_common/utils/tests/get-repository';
import { getTestingModuleImports } from '../../_common/utils/tests/get-testing-module-imports';
import { LinkEntity } from '../../links/dao/link.entity';
import { MIN_PASSWORD_LENGTH } from '../constants';
import { UserEntity } from '../dao/user.entity';
import { UsersModule } from '../users.module';

describe('users.controller.e2e.spec.ts', () => {
  let app: INestApplication,
    testingModule: TestingModule,
    httpServer: Server,
    usersRepository: Repository<UserEntity>;

  const url = '/users';

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [...getTestingModuleImports([UserEntity, LinkEntity]), UsersModule],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));

    usersRepository = getRepository<UserEntity>(testingModule, UserEntity);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(testingModule);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    let userData: { email?: string; password?: string };
    beforeEach(() => {
      userData = {
        email: faker.internet.email(),
        password: faker.string.sample(26),
      };
    });

    describe('if email or password is wrong', () => {
      describe('if email is wrong', () => {
        it('if email is invalid should return 400 Bad Request', async () => {
          userData.email = faker.string.sample(10);

          await request(httpServer).post(url).send(userData).expect(HttpStatus.BAD_REQUEST);
        });
        it('if email is empty string should return 400 Bad Request', async () => {
          userData.email = '';

          await request(httpServer).post(url).send(userData).expect(HttpStatus.BAD_REQUEST);
        });
        it('if email is undefined should return 400 Bad Request', async () => {
          userData.email = undefined;

          await request(httpServer).post(url).send(userData).expect(HttpStatus.BAD_REQUEST);
        });
      });
      describe('if password is wrong', () => {
        it('if password is short should return 400 Bad Request', async () => {
          userData.email = faker.string.sample(MIN_PASSWORD_LENGTH - 1);

          await request(httpServer).post(url).send(userData).expect(HttpStatus.BAD_REQUEST);
        });
        it('if password is empty string should return 400 Bad Request', async () => {
          userData.email = '';

          await request(httpServer).post(url).send(userData).expect(HttpStatus.BAD_REQUEST);
        });
        it('if password is undefined should return 400 Bad Request', async () => {
          userData.email = undefined;

          await request(httpServer).post(url).send(userData).expect(HttpStatus.BAD_REQUEST);
        });
      });
    });

    it('should return 409 Conflict if user with this email already exists', async () => {
      await usersRepository.save({
        email: userData.email,
        passwordHash: faker.internet.password(),
      });

      await request(httpServer).post(url).send(userData).expect(HttpStatus.CONFLICT);
    });

    it('should create user and return sanitized payload', async () => {
      const result = await request(httpServer).post(url).send(userData).expect(HttpStatus.CREATED);

      const { body } = result;

      const users = await usersRepository.find({
        select: ['id', 'email', 'createdAt', 'updatedAt'],
        where: { email: userData.email },
      });

      expect(users.length).toBe(1);

      expect(body).toMatchObject({
        id: users[0].id,
        email: users[0].email,
        createdAt: users[0].createdAt.toISOString(),
        updatedAt: users[0].updatedAt.toISOString(),
      });

      expect(Object.keys(body).length).toBe(4);

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });
  });
});
