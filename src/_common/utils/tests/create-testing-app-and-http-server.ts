import { Server } from 'node:http';

import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';

import { getValidationPipeParams } from '../../app/get-validation-pipe-params';
import { QueryFailedFilter } from '../../filters/query-failed.filter';

export const createTestingAppAndHttpServer = async (
  testingModule: TestingModule,
): Promise<{
  app: INestApplication;
  httpServer: Server;
}> => {
  const app = testingModule.createNestApplication();
  app.useGlobalFilters(new QueryFailedFilter());
  app.useGlobalPipes(new ValidationPipe(getValidationPipeParams(true)));

  await app.init();

  const httpServer = app.getHttpServer();

  return {
    app,
    httpServer,
  };
};
