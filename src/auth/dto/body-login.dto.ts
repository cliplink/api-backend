import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

import { BodyLogin } from '../../_contracts';

export class BodyLoginDto implements BodyLogin {
  @ApiProperty()
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @MinLength(5)
  password: string;
}
