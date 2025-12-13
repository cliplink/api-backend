import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NATS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const natsConfig = configService.getOrThrow('nats');
          return {
            transport: Transport.NATS,
            options: {
              servers: [natsConfig.server],
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
