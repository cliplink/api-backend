import { Server } from 'node:http';

import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { addMonths } from 'date-fns';
import * as request from 'supertest';
import type { Repository } from 'typeorm';

import { LinksController } from './links.controller';
import { clearTables } from '../../_common/utils/tests/clear-tables';
import { createTestingAppAndHttpServer } from '../../_common/utils/tests/create-testing-app-and-http-server';
import { getRepository } from '../../_common/utils/tests/get-repository';
import { getTestingModuleImports } from '../../_common/utils/tests/get-testing-module-imports';
import { CreateLink } from '../../_contracts';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { UserEntity } from '../../users/dao/user.entity';
import { LinkEntity } from '../dao/link.entity';
import { LinksRepository } from '../repositories/links.reposiory';
import { LinksService } from '../services/links.service';

describe('links.controller.e2e.spec.ts', () => {
  let app: INestApplication,
    testingModule: TestingModule,
    httpServer: Server,
    linksRepository: Repository<LinkEntity>,
    linkData: CreateLink,
    configService: ConfigService;

  const url = '/links';

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports([LinkEntity, UserEntity]),
        TypeOrmModule.forFeature([LinkEntity, UserEntity]),
      ],
      controllers: [LinksController],
      providers: [LinksService, LinksRepository],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));

    linksRepository = getRepository<LinkEntity>(testingModule, LinkEntity);
    configService = testingModule.get(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(testingModule);

    linkData = {
      target: faker.internet.url(),
      expiresAt: faker.date.future(),
    };
  });

  it('should create link and return sanitized payload', async () => {
    const result = await request(httpServer).post(url).send(linkData).expect(HttpStatus.CREATED);

    const links = await linksRepository.find();
    expect(links.length).toBe(1);
    expect(links[0].target).toBe(linkData.target);

    const { body } = result;

    expect(body).toMatchObject({
      shortId: expect.any(String),
      target: linkData.target,
      userId: null,
      expiresAt: linkData.expiresAt.toISOString(),
      createdAt: expect.any(String),
      deletedAt: null,
    });
  });

  describe('expiresAt field checks', () => {
    it('should return error if expiresAt is in the past', async () => {
      linkData.expiresAt = faker.date.past();
      await request(httpServer).post(url).send(linkData).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return error if expiresAt exceeds max age', async () => {
      linkData.expiresAt = addMonths(
        new Date(),
        configService.getOrThrow<number>('linksModule.linkMaxAgeMonths') + 12,
      );
      await request(httpServer).post(url).send(linkData).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return if expiresAt is not date', async () => {
      await request(httpServer)
        .post(url)
        .send({
          ...linkData,
          expiresAt: faker.string.sample(10),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  it('should return error target is not url', async () => {
    linkData.target = faker.string.sample(10);
    await request(httpServer).post(url).send(linkData).expect(HttpStatus.BAD_REQUEST);
  });
});
