import { Controller, Get, Param, Redirect, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ClickDto } from '../dto';
import { ClicksService } from '../services/clicks.service';

@ApiTags('Clicks')
@Controller(['c', 'clicks'])
export class ClicksController {
  constructor(private readonly clicksService: ClicksService) {}

  @Get(':shortId')
  @ApiOperation({ summary: 'Redirect to target URL by short ID' })
  @ApiResponse({ status: 302, description: 'Redirect to target URL', type: ClickDto })
  @Redirect()
  async redirectToTarget(
    @Param('shortId') shortId: string,
    @Req() req: Request,
  ): Promise<ClickDto> {
    const link = await this.clicksService.getLinkByShortId(shortId);

    this.clicksService.publishClickEvent(link, req);

    return { url: link.target, statusCode: 302 };
  }
}
