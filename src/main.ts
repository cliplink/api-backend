import { randomUUID } from 'crypto';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { getValidationPipeParams } from './_common/app/get-validation-pipe-params';
import { QueryFailedFilter } from './_common/filters/query-failed.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');

  app.useGlobalFilters(new QueryFailedFilter());
  app.useGlobalPipes(new ValidationPipe(getValidationPipeParams(true)));

  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
