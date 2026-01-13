import { createHash } from 'node:crypto';

import { CLICK_CREATED_SUBJECT } from '@cliplink/click-worker-contracts';
import { NATS_CONNECTION_SERVICE } from '@cliplink/utils';
import { faker } from '@faker-js/faker';
import { jetstream } from '@nats-io/jetstream';
import { Test, TestingModule } from '@nestjs/testing';
import { type Request } from 'express';

import { ClicksService } from './clicks.service';
import { LinkEntity } from '../../links/dao/link.entity';
import { LinksService } from '../../links/services/links.service';

jest.mock('@nats-io/jetstream', () => ({
  jetstream: jest.fn(),
}));

describe('ClickService', () => {
  let module: TestingModule;
  let clickService: ClicksService;
  let linkService: jest.Mocked<LinksService>;
  const mockJetStreamClient = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    (jetstream as jest.Mock).mockReturnValue(mockJetStreamClient);

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
          provide: NATS_CONNECTION_SERVICE,
          useValue: {},
        },
      ],
    }).compile();

    clickService = module.get(ClicksService);
    linkService = module.get(LinksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    it('should publish click event to JetStream with ip if ip exists', async () => {
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

      await clickService.publishClickEvent(link, req);

      expect(mockJetStreamClient.publish).toHaveBeenCalledTimes(1);
      const [subject, payload] = mockJetStreamClient.publish.mock.calls[0];

      expect(subject).toBe(CLICK_CREATED_SUBJECT);

      const decodedEvent = JSON.parse(new TextDecoder().decode(payload));
      expect(decodedEvent).toEqual(
        expect.objectContaining({
          linkId: link.id,
          occurredAt: expect.any(String),
          ipHash: expectedIpHash,
          userAgent: req.headers['user-agent'],
          referer: req.headers['referer'],
          forwardedFor: String(req.headers['x-forwarded-for']),
        }),
      );
    });

    it('should publish click event without ipHash if ip is missing', async () => {
      const link = { id: 'link-id' } as LinkEntity;
      const req = {
        headers: {
          'user-agent': faker.internet.userAgent(),
        },
      } as unknown as Request;

      await clickService.publishClickEvent(link, req);

      expect(mockJetStreamClient.publish).toHaveBeenCalledTimes(1);
      const [, payload] = mockJetStreamClient.publish.mock.calls[0];
      const decodedEvent = JSON.parse(new TextDecoder().decode(payload));

      expect(decodedEvent.ipHash).toBeUndefined();
    });
  });
});
