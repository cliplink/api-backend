import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { getValidationPipeParams } from './_common/app/get-validation-pipe-params';
import { QueryFailedFilter } from './_common/filters/query-failed.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });
  app.useGlobalFilters(new QueryFailedFilter());
  app.useGlobalPipes(new ValidationPipe(getValidationPipeParams(true)));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
