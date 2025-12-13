import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsUrl } from 'class-validator';

import { TransformToDate } from '../../_common/utils/decorators/transform-to-date.decorator';
import { CreateLink } from '../../_contracts';

export class CreateLinkDto implements CreateLink {
  @ApiProperty()
  @Expose()
  @IsUrl()
  public target: string;

  @ApiProperty()
  @Expose()
  @TransformToDate()
  @IsDate()
  public expiresAt: Date;
}
