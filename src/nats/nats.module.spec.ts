import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { NATS_SERVICE } from './constants';
import { NatsModule } from './nats.module';

describe('NatsModule', () => {
  const mockNatsServer = 'nats://localhost:4222';
  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should compile the module and provide the NATS_SERVICE client', async () => {
    mockConfigService.getOrThrow.mockReturnValue({ server: mockNatsServer });

    const module: TestingModule = await Test.createTestingModule({
      imports: [NatsModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    const natsClient = module.get<ClientProxy>(NATS_SERVICE);

    expect(module).toBeDefined();
    expect(natsClient).toBeDefined();
    expect(natsClient).toBeInstanceOf(ClientProxy);
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('nats');

    await module.close();
  });

  it('should throw an error if nats configuration is missing', async () => {
    const errorMessage = 'Missing NATS configuration';
    mockConfigService.getOrThrow.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await expect(
      Test.createTestingModule({
        imports: [NatsModule],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile(),
    ).rejects.toThrow(errorMessage);
  });
});
