import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { RequestExtended } from '../../_common/types';
import { transformToDto } from '../../_common/utils/transform-to-dto';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { RATE_LIMITER_SCOPE_NAME } from '../constants';
import { CreateLinkDto, LinkDto } from '../dto';
import { LinksService } from '../services/links.service';

@ApiTags('Links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Throttle({ [RATE_LIMITER_SCOPE_NAME]: {} })
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Create short link' })
  @ApiCreatedResponse({ type: LinkDto })
  async createLink(
    @Body() linkData: CreateLinkDto,
    @Request() req: RequestExtended,
  ): Promise<LinkDto> {
    const userId = req.user?.id || null;
    const link = await this.linksService.create({ ...linkData, userId });

    return transformToDto(LinkDto, link);
  }
}
