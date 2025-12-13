import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Login } from '../../_contracts';

export class LoginDto implements Login {
  @ApiProperty()
  @Expose()
  accessToken: string;
}
