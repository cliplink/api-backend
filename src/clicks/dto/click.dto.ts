import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Click } from '../../_contracts';

export class ClickDto implements Click {
  @ApiProperty()
  @Expose()
  url: string;

  @ApiProperty()
  @Expose()
  statusCode: number;
}
