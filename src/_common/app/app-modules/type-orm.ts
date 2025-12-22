import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import type { AppConfig } from '../../types';

export default TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AppConfig>) => {
    const opts = configService.getOrThrow<TypeOrmModuleOptions>('databaseConnectionOptions');

    if (!opts) throw new Error('Database config is missing');

    return {
      ...opts,
      autoLoadEntities: true,
    };
  },
});
