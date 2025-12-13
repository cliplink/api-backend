import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

import { AppConfig } from '../../_common/types';
import { PARTITION_JOB_NAME, PARTITION_QUEUE, PARTITION_SCHEDULER_ID } from '../constants';

@Injectable()
export class LinksInitJobsService implements OnModuleInit {
  constructor(
    @InjectQueue(PARTITION_QUEUE) private readonly queue: Queue,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  public async onModuleInit(): Promise<void> {
    const linksModuleOpts = this.configService.getOrThrow('linksModule');

    await this.queue.upsertJobScheduler(
      PARTITION_SCHEDULER_ID,
      { pattern: linksModuleOpts.linksPartitionCronPattern },
      {
        name: PARTITION_JOB_NAME,
        opts: {
          attempts: 5,
          removeOnComplete: true,
          removeOnFail: true,
        },
      },
    );
  }
}
