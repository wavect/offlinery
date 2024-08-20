import {Controller, Get, UseInterceptors} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.guard';

@Controller({
  version: '1',
  path: 'main',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** @dev Helper route to determine when the backend got started. Can be helpful to determine if an update has been shipped. */
  @Public()
  @Get('uptime')
  getUptime(): string {
    return this.appService.getUptime();
  }
}
