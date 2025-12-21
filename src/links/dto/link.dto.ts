import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { TransformToDateString } from '../../_common/utils/decorators/transform-to-date-string.decorator';
import { Link } from '../../_contracts';

export class LinkDto implements Link {
  @ApiProperty()
  @Expose()
  public shortId: string;

  @ApiProperty()
  @Expose()
  public target: string;

  @ApiProperty({ nullable: true })
  @Expose()
  public userId: string | null;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public expiresAt: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  createdAt: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  deletedAt: string | null;
}
