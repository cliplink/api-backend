import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { TransformToDateString } from '../../_common/utils/decorators/transform-to-date-string.decorator';
import { User } from '../../_contracts';

export class UserDto implements User {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public email: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public updatedAt: string;
}
