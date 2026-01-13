import { NatsModule } from '@cliplink/utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import bullMq from './_common/app/app-modules/bull-mq';
import pinoLogger from './_common/app/app-modules/pino-logger';
import throttler, { ThrottlerGuardProvider } from './_common/app/app-modules/throttler';
import typeOrm from './_common/app/app-modules/type-orm';
import { AuthModule } from './auth/auth.module';
import { ClicksModule } from './clicks/clicks.module';
import config from './config';
import { LinksModule } from './links/links.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    pinoLogger,
    throttler,
    bullMq,
    typeOrm,
    NatsModule,
    AuthModule,
    ClicksModule,
    LinksModule,
    UsersModule,
  ],
  providers: [ThrottlerGuardProvider],
})
export class AppModule {}
