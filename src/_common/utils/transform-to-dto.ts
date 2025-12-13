import { Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

const TRANSFORM_OPTIONS: ClassTransformOptions = {
  enableImplicitConversion: true,
  exposeUnsetFields: true,
  excludeExtraneousValues: true,
};

export function transformToDto<T>(type: Type<T>, source: unknown): T {
  return plainToInstance(type, source, TRANSFORM_OPTIONS);
}
