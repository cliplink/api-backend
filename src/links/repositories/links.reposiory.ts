import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { LinkEntity } from '../dao/link.entity';

@Injectable()
export class LinksRepository {
  constructor(@InjectRepository(LinkEntity) private repository: Repository<LinkEntity>) {}

  public async save(entity: DeepPartial<LinkEntity>): Promise<LinkEntity> {
    return this.repository.save(entity);
  }

  public async findByShortId(shortId: string): Promise<LinkEntity | null> {
    return this.repository.findOne({ where: { shortId } });
  }
}
