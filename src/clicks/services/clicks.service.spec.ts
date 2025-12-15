import { createHash } from 'node:crypto';

import { faker } from '@faker-js/faker';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { type Request } from 'express';

import { ClicksService } from './clicks.service';
import { LinkEntity } from '../../links/dao/link.entity';
import { LinksService } from '../../links/services/links.service';
import { NATS_SERVICE } from '../../nats/constants';

describe('ClickService', () => {
  let module: TestingModule;
  let clickService: ClicksService;
  let linkService: jest.Mocked<LinksService>;
  let natsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ClicksService,
        {
          provide: LinksService,
          useValue: {
            getByShortId: jest.fn(),
          },
        },
        {
          provide: NATS_SERVICE,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    clickService = module.get(ClicksService);
    linkService = module.get(LinksService);
    natsClient = module.get(NATS_SERVICE);
  });

  describe('getLinkByShortId method', () => {
    it('should delegate call to LinkService', async () => {
      const shortId = faker.string.sample(8);
      const link = { id: 'link-id' } as LinkEntity;

      linkService.getByShortId.mockResolvedValue(link);

      const result = await clickService.getLinkByShortId(shortId);

      expect(linkService.getByShortId).toHaveBeenCalledTimes(1);
      expect(linkService.getByShortId).toHaveBeenCalledWith(shortId);
      expect(result).toEqual(link);
    });
  });

  describe('publishClickEvent method', () => {
    it('should publish click event with ip if ip exists', async () => {
      const link = { id: 'link-id' } as LinkEntity;
      const ip = faker.internet.ip();
      const req = {
        ip,
        headers: {
          'user-agent': faker.internet.userAgent(),
          referer: faker.internet.url(),
          'x-forwarded-for': faker.internet.ip(),
        },
      } as unknown as Request;

      const expectedIpHash = createHash('sha256').update(ip).digest('hex');

      clickService.publishClickEvent(link, req);

      expect(natsClient.emit).toHaveBeenCalledTimes(1);
      expect(natsClient.emit).toHaveBeenCalledWith(
        'click.created',
        expect.objectContaining({
          linkId: link.id,
          occurredAt: expect.any(String),
          ipHash: expectedIpHash,
          userAgent: req.headers['user-agent'],
          referer: req.headers['referer'],
          forwardedFor: req.headers['x-forwarded-for'],
        }),
      );
    });
  });
});
