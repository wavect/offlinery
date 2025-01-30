import { OnlyAdmin, Public } from "@/auth/auth.guard";
import { EventPublicDTO } from "@/DTOs/event-public.dto";
import { NewEventResponseDTO } from "@/DTOs/new-event-response.dto";
import { NewEventDTO } from "@/DTOs/new-event.dto";
import { NewTestEventDTO } from "@/DTOs/new-test-event.dto";
import { ELanguage } from "@/types/user.types";
import {
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
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

    @Get(`events/:lang`)
    @ApiParam({
        name: "lang",
        type: "string",
        description: "Language to get event data in.",
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    @ApiOperation({ summary: "Get upcoming and active events" })
    async getAllUpcomingEvents(
        @Param("lang") lang: ELanguage,
    ): Promise<EventPublicDTO[]> {
        if (!lang) {
            this.logger.error(
                `Language not provided, MultiLingualStrings will be undefined!`,
            );
        }
        const events = await this.eventService.getAllUpcomingEvents();
        return events.map((event) => event.convertToPublicDTO(lang));
    }

    @Post("admin/new-event")
    @Public()
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: "Send event notifications" })
    @ApiBody({
        type: NewEventDTO,
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
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
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    async testNewEvent(
        @Body() eventDTO: NewTestEventDTO,
    ): Promise<NewEventResponseDTO> {
        return await this.eventService.createNewTestEvent(eventDTO);
    }
}
