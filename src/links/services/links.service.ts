import * as crypto from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareAsc, subMonths } from 'date-fns';

import { AppConfig } from '../../_common/types';
import { type CreateLink } from '../../_contracts';
import { PostgresErrorCode } from '../../database/postgres-error-codes.enum';
import { ALPHABET, ALPHABET_LEN, SHORT_ID_LEN } from '../constants';
import { LinkEntity } from '../dao/link.entity';
import { LinksRepository } from '../repositories/links.reposiory';

@Injectable()
export class LinksService {
  private readonly linkMaxAgeMonths: number;

  constructor(
    private linksRepository: LinksRepository,
    private readonly configService: ConfigService,
  ) {
    const linksModuleOpts = this.configService.getOrThrow<AppConfig['linksModule']>('linksModule');
    this.linkMaxAgeMonths = linksModuleOpts.linkMaxAgeMonths;
  }

  public async create(data: CreateLink): Promise<LinkEntity> {
    if (compareAsc(data.expiresAt, subMonths(new Date(), this.linkMaxAgeMonths)) < 0) {
      throw new BadRequestException('expiresAt must be less than 1 year ago');
    }

    for (;;) {
      const shortId = this.getRandomShortId(SHORT_ID_LEN);

      try {
        return await this.linksRepository.save({
          ...data,
          shortId,
        });
      } catch (e: unknown) {
        const err = e as { code?: string };

        if (err.code === PostgresErrorCode.UniqueViolation) {
          continue;
        }
        throw e;
      }
    }
  }

  public async getByShortId(shortId: string): Promise<LinkEntity> {
    const link = await this.linksRepository.findByShortId(shortId);

    if (!link || link.deletedAt) {
      throw new NotFoundException('Link not found');
    }

    if (link.expiresAt && link.expiresAt.getTime() < new Date().getTime()) {
      throw new NotFoundException('Link has expired');
    }

    return link;
  }

  private getRandomShortId(length: number): string {
    const bytes = crypto.randomBytes(length);
    let id = '';

    for (let i = 0; i < length; i++) {
      const index = bytes[i] % ALPHABET_LEN;
      id += ALPHABET[index];
    }

    return id;
  }
}
