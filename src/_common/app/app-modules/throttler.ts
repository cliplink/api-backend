import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { RATE_LIMITER_CREATE_LINKS } from '../../../links/constants';
import type { AppConfig } from '../../types';
import { RATE_LIMITER_COMMON } from '../constants';

export default ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AppConfig>) => {
    const linkModuleConfig = configService.getOrThrow<AppConfig['linksModule']>('linksModule');
    const rateLimitWindow =
      configService.getOrThrow<AppConfig['rateLimitWindow']>('rateLimitWindow');
    const rateLimitMaxRequests =
      configService.getOrThrow<AppConfig['rateLimitMaxRequests']>('rateLimitMaxRequests');
    const redis = configService.getOrThrow<AppConfig['redis']>('redis');

    return {
      throttlers: [
        {
          name: RATE_LIMITER_COMMON,
          ttl: rateLimitWindow,
          limit: rateLimitMaxRequests,
          setHeaders: false,
        },
        {
          name: RATE_LIMITER_CREATE_LINKS,
          ttl: linkModuleConfig.rateLimitWindow,
          limit: linkModuleConfig.rateLimitMaxRequests,
          setHeaders: false,
        },
      ],
      storage: new ThrottlerStorageRedisService(`redis://${redis.host}:${redis.port}`),
    };
  },
});

export const ThrottlerGuardProvider = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};
