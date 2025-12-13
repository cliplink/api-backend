import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { PostgresErrorCode } from '../../database/postgres-error-codes.enum';

interface DatabaseError {
  code?: string;
  detail?: string;
}

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log(`exception`);
    console.log(exception);
    const driverError = exception.driverError as DatabaseError;

    if (driverError.code === PostgresErrorCode.UniqueViolation) {
      const match = driverError.detail?.match(/Key \((.+)\)=/);
      const key = match ? match[1] : 'Record';

      const conflictException = new ConflictException(`${key} already exists`);
      response.status(HttpStatus.CONFLICT).json(conflictException.getResponse());
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
}
