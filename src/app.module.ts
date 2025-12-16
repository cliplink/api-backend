import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { QueueOptions } from 'bullmq';

import { RATE_LIMITER_COMMON } from './_common/app/constants';
import { type AppConfig } from './_common/types';
import { AuthModule } from './auth/auth.module';
import { ClicksModule } from './clicks/clicks.module';
import config from './config';
import { RATE_LIMITER_CREATE_LINKS } from './links/constants';
import { LinksModule } from './links/links.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    BullModule.forRootAsync({
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
    }),
    TypeOrmModule.forRootAsync({
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
    }),
    ThrottlerModule.forRootAsync({
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
            },
            {
              name: RATE_LIMITER_CREATE_LINKS,
              ttl: linkModuleConfig.rateLimitWindow,
              limit: linkModuleConfig.rateLimitMaxRequests,
            },
          ],
          storage: new ThrottlerStorageRedisService(`redis://${redis.host}:${redis.port}`),
        };
      },
    }),
    AuthModule,
    ClicksModule,
    LinksModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
