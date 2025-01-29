import { OnlyAdmin } from "@/auth/auth.guard";
import { NewEventResponseDTO } from "@/DTOs/new-event-response.dto";
import { NewEventDTO } from "@/DTOs/new-event.dto";
import { NewTestEventDTO } from "@/DTOs/new-test-event.dto";
import {
    Body,
    Controller,
    Logger,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { EventService } from "./event.service";

@ApiTags("Event")
@Controller({
    version: "1",
    path: "event",
})
export class EventController {
    private readonly logger = new Logger(EventController.name);

    constructor(private readonly eventService: EventService) {}

    @Post("admin/new-event")
    @OnlyAdmin()
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: "Send event notifications" })
    @ApiBody({
        type: NewEventDTO,
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async createNewEvent(
        @Body() eventDTO: NewEventDTO,
    ): Promise<NewEventResponseDTO> {
        return await this.eventService.createNewEvent(eventDTO);
    }

    @Post("admin/new-test-event")
    @OnlyAdmin()
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: "Send test event notifications" })
    @ApiBody({
        type: NewTestEventDTO,
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async testNewEvent(
        @Body() eventDTO: NewTestEventDTO,
    ): Promise<NewEventResponseDTO> {
        return await this.eventService.createNewTestEvent(eventDTO);
    }
}
