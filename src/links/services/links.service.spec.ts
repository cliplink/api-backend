import * as crypto from 'node:crypto';

import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { subDays } from 'date-fns';

import { LinksService } from './links.service';
import { CreateLink } from '../../_contracts';
import { PostgresErrorCode } from '../../database/postgres-error-codes.enum';
import { ALPHABET, SHORT_ID_LEN } from '../constants';
import { LinkEntity } from '../dao/link.entity';
import { LinksRepository } from '../repositories/links.reposiory';

const makeLinkEntity = (overrides: Partial<LinkEntity> = {}): LinkEntity => ({
  id: faker.number.int().toString(),
  shortId: ALPHABET[1].repeat(SHORT_ID_LEN),
  target: faker.internet.url(),
  userId: null,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeCreateLinkDto = (overrides: Partial<CreateLink> = {}): CreateLink => ({
  target: faker.internet.url(),
  expiresAt: new Date(Date.now() + 60_000),
  userId: null,
  ...overrides,
});

describe('LinksService', () => {
  let service: LinksService;
  let repository: jest.Mocked<LinksRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: LinksRepository,
          useValue: {
            save: jest.fn(),
            findByShortId: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue({
              linkMaxAgeMonths: 12,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(LinksService);
    repository = module.get(LinksRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('throws if expiresAt is in the past', async () => {
      const dto: CreateLink = {
        target: faker.internet.url(),
        expiresAt: new Date(Date.now() - 1000),
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws if expiresAt exceeds max age', async () => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 13);

      const dto: CreateLink = {
        target: faker.internet.url(),
        expiresAt,
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('saves link with generated shortId', async () => {
      jest.spyOn(crypto, 'randomBytes').mockImplementation((size: number) => Buffer.alloc(size, 1));

      const target = faker.internet.url();
      const dto = makeCreateLinkDto({ target });
      const linkEntity = makeLinkEntity({ target });

      repository.save.mockResolvedValue(linkEntity);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          target,
          shortId: linkEntity.shortId,
        }),
      );

      expect(result.shortId).toBe(linkEntity.shortId);
    });

    it('retries when shortId is not unique', async () => {
      jest
        .spyOn(crypto, 'randomBytes')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementationOnce((size: number) => Buffer.from([1, 1, 1, 1, 1, 1]))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementationOnce((size: number) => Buffer.from([2, 2, 2, 2, 2, 2]));

      const shortId = ALPHABET[1].repeat(SHORT_ID_LEN - 1);

      repository.save
        .mockRejectedValueOnce({ code: PostgresErrorCode.UniqueViolation })
        .mockResolvedValueOnce(makeLinkEntity({ shortId }));

      const result = await service.create(makeCreateLinkDto());

      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(result.shortId).toBe(shortId);
    });

    it('rethrows unknown repository error', async () => {
      const errorMsg = 'db down';
      repository.save.mockRejectedValue(new Error(errorMsg));

      await expect(service.create(makeCreateLinkDto())).rejects.toThrow(errorMsg);
    });

    it('passes userId to repository', async () => {
      const userId = faker.string.uuid();
      repository.save.mockResolvedValue(makeLinkEntity({ userId }));

      await service.create(makeCreateLinkDto({ userId }));

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
        }),
      );
    });
  });

  describe('getByShortId', () => {
    it('throws if link not found', async () => {
      repository.findByShortId.mockResolvedValue(null);

      await expect(service.getByShortId('abc')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws if link is deleted', async () => {
      repository.findByShortId.mockResolvedValue(makeLinkEntity({ deletedAt: new Date() }));

      await expect(service.getByShortId('abc')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws if link is expired', async () => {
      repository.findByShortId.mockResolvedValue(
        makeLinkEntity({
          expiresAt: subDays(new Date(), 1),
        }),
      );

      await expect(service.getByShortId('abc')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns link if valid', async () => {
      const link = makeLinkEntity();

      repository.findByShortId.mockResolvedValue(link);

      const result = await service.getByShortId(faker.string.sample(8));

      expect(result).toBe(link);
    });
  });
});
