import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { isDateString } from 'class-validator';

export function TransformToDate() {
  return Transform(({ value, key }) => {
    if (typeof value === 'string') {
      if (!isDateString(value)) {
        throw new BadRequestException(`${key} must be a valid ISO 8601 date string`);
      }

      return new Date(value);
    }
    return value;
  });
}
