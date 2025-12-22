import type { Server } from 'node:http';

import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays } from 'date-fns';
import * as request from 'supertest';

import { ClicksController } from './clicks.controller';
import { createTestingAppAndHttpServer } from '../../_common/utils/tests/create-testing-app-and-http-server';
import { type LinkEntity } from '../../links/dao/link.entity';
import { LinksService } from '../../links/services/links.service';
import { NATS_SERVICE } from '../../nats/constants';
import { ClicksService } from '../services/clicks.service';

describe('clicks.controller.e2e.spec.ts', () => {
  const url = '/c';

  let app: INestApplication,
    httpServer: Server,
    testingModule: TestingModule,
    clicksService: jest.Mocked<ClicksService>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [ClicksController],
      providers: [
        {
          provide: ClicksService,
          useValue: {
            getLinkByShortId: jest.fn(),
            publishClickEvent: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(NATS_SERVICE)
      .useValue({
        emit: jest.fn(),
      })
      .overrideProvider(LinksService)
      .useValue({
        getByShortId: jest.fn(),
      })
      .compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));

    clicksService = testingModule.get(ClicksService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /clicks/:shortId', () => {
    let link: LinkEntity;

    beforeEach(async () => {
      link = {
        id: faker.number.int().toString(),
        userId: null,
        shortId: faker.string.sample(8),
        target: faker.internet.url(),
        expiresAt: addDays(new Date(), 1),
        createdAt: new Date(),
        deletedAt: null,
      };
    });

    it('should redirect', async () => {
      clicksService.getLinkByShortId.mockResolvedValueOnce(Promise.resolve(link));

      const result = await request(httpServer)
        .get(`${url}/${link.shortId}`)
        .expect(HttpStatus.FOUND);
      expect(result.header.location).toBe(link.target);

      expect(clicksService.publishClickEvent).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if link not found', async () => {
      link.shortId = faker.string.sample(8);
      clicksService.getLinkByShortId.mockRejectedValueOnce(new NotFoundException());

      await request(httpServer)
        .get(`${url}/${faker.string.sample(8)}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(clicksService.publishClickEvent).toHaveBeenCalledTimes(0);
    });
  });
});
