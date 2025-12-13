import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { AppModule } from '../../../app.module';
import { getValidationPipeParams } from '../../app/get-validation-pipe-params';
import { QueryFailedFilter } from '../../filters/query-failed.filter';

export const createTestingModuleAndApp = async (): Promise<{
  testingModule: TestingModule;
  app: INestApplication;
}> => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = testingModule.createNestApplication();
  app.useGlobalFilters(new QueryFailedFilter());
  app.useGlobalPipes(new ValidationPipe(getValidationPipeParams(true)));

  await app.init();

  return {
    testingModule,
    app,
  };
};
