import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { TransformToDateString } from '../../_common/utils/decorators/transform-to-date-string.decorator';
import { Link } from '../../_contracts';
import { UserDto } from '../../users/dto/user.dto';

export class LinkDto implements Link {
  @ApiProperty()
  @Expose()
  public shortId: string;

  @ApiProperty()
  @Expose()
  public target: string;

  @ApiProperty({ nullable: true })
  @Expose()
  @TransformToDateString()
  public userId: string | null;

  @ApiProperty()
  @Expose()
  public expiresAt: string;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  deletedAt: string | null;

  @ApiProperty({ nullable: true, type: UserDto })
  @Expose()
  @TransformToDateString()
  user?: UserDto | null;
}
