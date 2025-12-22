import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

import type { AppConfig } from '../../types';

export default BullModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AppConfig>): QueueOptions => {
    const redisConfig = configService.getOrThrow('redis');
    return {
      connection: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
    };
  },
});
