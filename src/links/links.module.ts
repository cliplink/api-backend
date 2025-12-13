import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PARTITION_QUEUE } from './constants';
import { LinksController } from './controllers/links.controller';
import { LinkEntity } from './dao/link.entity';
import { LinksRepository } from './repositories/links.reposiory';
import { LinksInitJobsService } from './services/links-init-jobs.service';
import { LinksPartitionManagerService } from './services/links-partition-manager.service';
import { LinksPartitionsJobService } from './services/links-partitions-job.service';
import { LinksService } from './services/links.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkEntity]),
    BullModule.registerQueue({
      name: PARTITION_QUEUE,
    }),
  ],
  controllers: [LinksController],
  providers: [
    LinksService,
    LinksRepository,
    LinksInitJobsService,
    LinksPartitionManagerService,
    LinksPartitionsJobService,
  ],
  exports: [LinksService],
})
export class LinksModule {}
