import { Controller, Get, Logger } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./auth/auth.guard";

@Controller({
    version: "1",
    path: "main",
})
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly appService: AppService) {}

    /** @dev Helper route to determine when the backend got started. Can be helpful to determine if an update has been shipped. */
    @Public()
    @Get("uptime")
    getUptime(): string {
        this.logger.debug(`Someone checked the uptime endpoint.`);
        return this.appService.getUptime();
    }
}
