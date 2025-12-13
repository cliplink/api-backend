import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { transformToDto } from '../../_common/utils/transform-to-dto';
import { User } from '../../_contracts';
import { BodyLoginDto, LoginDto } from '../dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: LoginDto })
  async login(
    @Request() req: ExpressRequest & { user: User },
    // for Swagger
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _loginDto: BodyLoginDto,
  ): Promise<LoginDto> {
    const loginData = await this.authService.login(req.user);

    return transformToDto(LoginDto, loginData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiNoContentResponse()
  async logout(@Request() req: ExpressRequest & { logout: () => void }) {
    return req.logout();
  }
}
