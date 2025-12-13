import { createHash } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

import { ClickCreatedEvent } from '../../_contracts';
import { LinkEntity } from '../../links/dao/link.entity';
import { LinksService } from '../../links/services/links.service';

@Injectable()
export class ClicksService {
  constructor(
    private readonly linksService: LinksService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  public async getLinkByShortId(
    shortId: string,
  ): Promise<ReturnType<typeof LinksService.prototype.getByShortId>> {
    return this.linksService.getByShortId(shortId);
  }

  public publishClickEvent(link: LinkEntity, req: Request): void {
    let ipHash: string | undefined;

    if (req.ip) {
      ipHash = createHash('sha256').update(req.ip).digest('hex');
    }

    const event: ClickCreatedEvent = {
      linkId: link.id,
      occurredAt: new Date().toISOString(),
      ipHash,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
      //country:,
      forwardedFor: String(req.headers['x-forwarded-for']),
    };

    this.natsClient.emit('click.created', event);
  }
}
