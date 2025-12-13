import * as path from 'node:path';

import { DataSource } from 'typeorm';

import config from '../config';

export const AppDataSource = new DataSource({
  ...config().databaseConnectionOptions,
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '..', '**', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
});
