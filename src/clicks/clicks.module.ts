import { Module } from '@nestjs/common';

import { LinksModule } from '../links/links.module';
import { ClicksController } from './controllers/clicks.controller';
import { ClicksService } from './services/clicks.service';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [LinksModule, NatsModule],
  controllers: [ClicksController],
  providers: [ClicksService],
})
export class ClicksModule {}
