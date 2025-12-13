import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { PARTITION_QUEUE } from '../constants';
import { LinksPartitionManagerService } from './links-partition-manager.service';

@Injectable()
@Processor(PARTITION_QUEUE)
export class LinksPartitionsJobService extends WorkerHost {
  constructor(private readonly linksPartitionManagerService: LinksPartitionManagerService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async process(_job: Job<unknown, unknown, string>): Promise<void> {
    await this.linksPartitionManagerService.createPartitions();
  }
}
