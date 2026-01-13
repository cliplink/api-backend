import { createHash } from 'node:crypto';

import { CLICK_CREATED_SUBJECT, ClickCreatedEvent } from '@cliplink/click-worker-contracts';
import { NATS_CONNECTION_SERVICE } from '@cliplink/utils';
import { jetstream, JetStreamClient, PubAck } from '@nats-io/jetstream';
import type { NatsConnection } from '@nats-io/nats-core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

import { LinkEntity } from '../../links/dao/link.entity';
import { LinksService } from '../../links/services/links.service';

@Injectable()
export class ClicksService {
  private readonly logger = new Logger(ClicksService.name);
  private readonly jetStreamClient: JetStreamClient;

  constructor(
    private readonly linksService: LinksService,
    @Inject(NATS_CONNECTION_SERVICE) private readonly nc: NatsConnection,
  ) {
    this.jetStreamClient = jetstream(this.nc);
  }

  public async getLinkByShortId(
    shortId: string,
  ): Promise<ReturnType<typeof LinksService.prototype.getByShortId>> {
    return this.linksService.getByShortId(shortId);
  }

  public publishClickEvent(link: LinkEntity, req: Request): Promise<PubAck> {
    let ipHash: string | undefined;

    if (req.ip) {
      ipHash = createHash('sha256').update(req.ip).digest('hex');
    }

    const event: ClickCreatedEvent = {
      linkId: link.id,
      occurredAt: new Date().toISOString(),
      ipHash,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      //country:,
      forwardedFor: String(req.headers['x-forwarded-for']),
    };

    const sc = new TextEncoder();
    const payload = sc.encode(JSON.stringify(event));

    try {
      return this.jetStreamClient.publish(CLICK_CREATED_SUBJECT, payload);
    } catch (err) {
      this.logger.error(`Error publishing to ${CLICK_CREATED_SUBJECT}`, err);
      throw err;
    }
  }
}
