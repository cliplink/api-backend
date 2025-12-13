import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AppConfig } from '../../_common/types';
import { AbstractPartitionManagerService } from '../../partition-manager/abstract-partition-manager.service';

@Injectable()
export class LinksPartitionManagerService extends AbstractPartitionManagerService {
  protected readonly logger = new Logger(LinksPartitionManagerService.name);
  protected tableName = 'links';
  protected readonly monthsToKeep: number;
  protected readonly archiveSchemaName: string;
  protected readonly moveTableToArchiveSchema: boolean;
  protected readonly dropOldTable: boolean;

  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    super();

    const moduleConfig = this.configService.getOrThrow<AppConfig['linksModule']>('linksModule');
    this.monthsToKeep = moduleConfig.partitionTableMonthsToKeep;
    this.archiveSchemaName = moduleConfig.partitionTableArchiveSchemaName;
    this.moveTableToArchiveSchema = moduleConfig.partitionTableMoveToArchiveSchema;
    this.dropOldTable = moduleConfig.partitionTableDropOldTable;
  }

  async onModuleInit() {
    this.logger.log('Partition manager started');

    await this.createPartitions();
  }
}
