import { DataSourceOptions } from 'typeorm';

export interface AppConfig {
  databaseConnectionOptions: DataSourceOptions;
  redis: {
    host: string;
    port: number;
  };
  linksModule: {
    linkMaxAgeMonths: number;
    linksPartitionCronPattern: string;
    partitionTableMonthsToKeep: number;
    partitionTableArchiveSchemaName: string;
    partitionTableMoveToArchiveSchema: boolean;
    partitionTableDropOldTable: boolean;
    linkCreateTtl: number;
    linkCreateLimit: number;
  };
  nats: {
    server: string;
  };
}
