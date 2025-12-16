import { type Server } from 'node:http';

import { faker } from '@faker-js/faker';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { clearTables } from '../../_common/utils/tests/clear-tables';
import { createTestingAppAndHttpServer } from '../../_common/utils/tests/create-testing-app-and-http-server';
import { getTestingModuleImports } from '../../_common/utils/tests/get-testing-module-imports';
import { PASSWORD_SALT } from '../../users/constants';
import { type UserEntity } from '../../users/dao/user.entity';
import { UsersService } from '../../users/services/users.service';
import { AuthModule } from '../auth.module';
import { LoginDto } from '../dto';

describe('auth.controller.e2e.spec.ts', () => {
  let app: INestApplication, httpServer: Server, testingModule: TestingModule;

  const url = '/auth';

  const usersServiceMock = {
    findOneByEmail: jest.fn(),
  };

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [...getTestingModuleImports(), AuthModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(testingModule);
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    let email: string;
    let password: string;
    let passwordHash: string;
    let mockUser: UserEntity;

    beforeEach(async () => {
      email = faker.internet.email();
      password = faker.string.sample(10);
      passwordHash = await bcrypt.hash(password, PASSWORD_SALT);

      mockUser = {
        id: faker.string.uuid(),
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersServiceMock.findOneByEmail.mockResolvedValue(mockUser);
    });

    describe.only('if email and password is correct', () => {
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
          await request(httpServer)
            .post(`${url}/login`)
            .send({
              email: faker.internet.email(),
              password,
            })
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
      describe('if password is wrong', () => {
        it('should not return return access token', async () => {
          await request(httpServer)
            .post(`${url}/login`)
            .send({
              email,
              password: faker.string.sample(10),
            })
            .expect(HttpStatus.UNAUTHORIZED);
        });
      });
    });
  });
});
