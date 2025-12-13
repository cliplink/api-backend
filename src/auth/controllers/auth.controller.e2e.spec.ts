import { type Server } from 'node:http';

import { faker } from '@faker-js/faker';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { createTestingModuleAndApp } from '../../_common/utils/tests/create-testing-module-and-app';
import { getRepository } from '../../_common/utils/tests/get-repository';
import { PASSWORD_SALT } from '../../users/constants';
import { UserEntity } from '../../users/dao/user.entity';
import { LoginDto } from '../dto';

describe('auth.controller.e2e.spec.ts', () => {
  let app: INestApplication,
    httpServer: Server,
    testingModule: TestingModule,
    usersRepository: Repository<UserEntity>;

  const url = '/auth';

  beforeAll(async () => {
    ({ testingModule, app } = await createTestingModuleAndApp());

    httpServer = app.getHttpServer();

    usersRepository = getRepository<UserEntity>(testingModule, UserEntity);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    let email: string, password: string;

    beforeEach(async () => {
      email = faker.internet.email();
      password = faker.string.sample(10);

      await usersRepository.insert({
        email,
        passwordHash: await bcrypt.hash(password, PASSWORD_SALT),
      });
    });

    describe('if email and password is correct', () => {
      it('should return access token', async () => {
        const result = await request(httpServer)
          .post(`${url}/login`)
          .send({
            email,
            password,
          })
          .expect(HttpStatus.CREATED);

        const body = result.body as LoginDto;

        expect(body).toHaveProperty('accessToken');
      });
    });
    describe('if email or password is wrong', () => {
      describe('if email is wrong', () => {
        it('should not return return access token', async () => {
          email = faker.internet.email();
          await request(httpServer)
            .post(`${url}/login`)
            .send({
              email,
              password,
            })
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
      describe('if password is wrong', () => {
        it('should not return return access token', async () => {
          password = faker.string.sample(10);
          await request(httpServer)
            .post(`${url}/login`)
            .send({
              email,
              password,
            })
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
    });
  });
});
