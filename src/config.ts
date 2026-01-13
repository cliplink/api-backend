/* eslint-disable import/order */
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

import * as process from 'node:process';
import { DataSourceOptions } from 'typeorm';
import { AppConfig } from './_common/types';

const databaseConnectionOptions: DataSourceOptions = {
  type: 'postgres',
  host: getEnv<string>('DB_HOST'),
  port: getEnv<number>('DB_PORT'),
  username: getEnv<string>('DB_LOGIN'),
  password: getEnv<string>('DB_PASSWORD'),
  database: getEnv<string>('DB_NAME'),
  logging: getEnv<boolean>('DB_ENABLE_LOGGING'),
  synchronize: false,
};

export default (): AppConfig => ({
  appName: getEnv<string>('APP_NAME', true),
  databaseConnectionOptions,
  redis: {
    host: getEnv<string>('REDIS_HOST', true),
    port: getEnv<number>('REDIS_PORT'),
  },
  linksModule: {
    linksPartitionCronPattern: getEnv<string>('LINKS_PARTITION_CRON_PATTERN', false) ?? '0 2 * * *',
    partitionTableMonthsToKeep: getEnv<number>('PARTITION_TABLE_MONTHS_TO_KEEP', false) ?? 12,
    partitionTableMoveToArchiveSchema:
      getEnv<boolean>('PARTITION_TABLE_MOVE_TO_ARCHIVE_SCHEMA', false) ?? false,
    partitionTableArchiveSchemaName:
      getEnv<string>('PARTITION_TABLE_ARCHIVE_SCHEMA_NAME', false) ?? '',
    partitionTableDropOldTable: getEnv<boolean>('PARTITION_TABLE_DROP_OLD_TABLE', false) ?? false,
    linkMaxAgeMonths: getEnv<number>('LINK_MAX_AGE_MONTHS', false) ?? 12,
    rateLimitWindow: getEnv<number>('LINKS_RATE_LIMIT_WINDOW', false) ?? 60000,
    rateLimitMaxRequests: getEnv<number>('LINKS_RATE_LIMIT_MAX_REQUESTS', false) ?? 5,
  },
  nats: {
    server: getEnv<string>('NATS_SERVER'),
  },
  rateLimitWindow: getEnv<number>('RATE_LIMIT_WINDOW', false) ?? 1000,
  rateLimitMaxRequests: getEnv<number>('RATE_LIMIT_MAX_REQUESTS', false) ?? 5,
});

function getEnv<T extends string | number | boolean>(envName: string, strict = true): T {
  const raw = process.env[envName];
  if (raw === undefined) {
    if (strict) {
      throw new Error(`Environment ${envName} is undefined.`);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return;
  }

  if (typeof ('' as T) === 'number') {
    return Number(raw) as T;
  }

  if (typeof ('' as T) === 'boolean') {
    return (raw === 'true') as T;
  }

  if (typeof ('' as T) === 'string') {
    return String(raw).trim() as T;
  }

  return raw as T;
}
