import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NewEventResponseDTO } from "@/DTOs/new-event-response.dto";
import { NewEventDTO } from "@/DTOs/new-event.dto";
import { NewTestEventDTO } from "@/DTOs/new-test-event.dto";
import { MultilingualStringService } from "@/entities/multilingual-string/multilingual-string.service";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { ELanguage } from "@/types/user.types";
import { countExpoPushTicketStatuses } from "@/utils/misc.utils";
import {
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";
import { Event } from "./event.entity";

@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);

    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private multilingualStringService: MultilingualStringService,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService,
        private readonly i18n: I18nService,
    ) {}

    async createNewEvent(newEvent: NewEventDTO): Promise<NewEventResponseDTO> {
        let responseDTO: NewEventResponseDTO = {
            error: 0,
            noPushToken: 0,
            ok: 0,
            total: 0,
        };

        try {
            const notifications: OfflineryNotification[] = [];
            const users = await this.userService.findAll(); // TODO!!!!

            for (const user of users) {
                if (!user.pushToken) {
                    this.logger.warn(
                        `No Push token available for user ${user.id}. Skipping in event.`,
                    );
                    responseDTO.total++;
                    responseDTO.noPushToken++;
                    continue;
                }
                const defaultLang = ELanguage.en;
                const userLanguage = user.preferredLanguage ?? defaultLang;
                const eventTitle: string =
                    newEvent.eventTitle[userLanguage] ??
                    newEvent.eventTitle[defaultLang];
                const eventDescription: string =
                    newEvent.eventDescription[userLanguage] ??
                    newEvent.eventDescription[defaultLang];

                notifications.push({
                    sound: "default" as const,
                    title: eventTitle,
                    body: eventDescription,
                    to: user.pushToken,
                    data: {
                        type: ENotificationType.NEW_EVENT,
                        screen: EAppScreens.NEW_EVENT,
                    },
                });
            }

            const expoPushTickets =
                await this.notificationService.sendPushNotifications(
                    notifications,
                );

            responseDTO = {
                ...responseDTO,
                ...(await countExpoPushTicketStatuses(expoPushTickets)),
            };
        } catch (err) {
            throw new InternalServerErrorException(err);
        }

        const newEventEntity: Event = this.eventRepository.create();
        await this.eventRepository.save(newEventEntity); // otherwise relationship constraints don't work
        newEventEntity.titles =
            await this.multilingualStringService.createTranslations(
                newEvent.eventTitle,
                newEventEntity.LBL_TITLE,
                newEventEntity.entityType,
                newEventEntity.id,
            );

        newEventEntity.descriptions =
            await this.multilingualStringService.createTranslations(
                newEvent.eventDescription,
                newEventEntity.LBL_DESCRIPTION,
                newEventEntity.entityType,
                newEventEntity.id,
            );
        newEventEntity.startDateTime = newEvent.eventStartDateTime;
        newEventEntity.endDateTime = newEvent.eventEndDateTime;
        await this.eventRepository.save(newEventEntity);

        this.logger.debug(`Event ${newEventEntity.id} persisted.`);

        return responseDTO;
    }

    async createNewTestEvent(
        newEvent: NewTestEventDTO,
    ): Promise<NewEventResponseDTO> {
        let responseDTO: NewEventResponseDTO = {
            error: 0,
            noPushToken: 0,
            ok: 0,
            total: 0,
        };

        try {
            const notifications: OfflineryNotification[] = [];

            for (const pushToken of newEvent.pushTokens) {
                notifications.push({
                    sound: "default" as const,
                    title: "[TEST EVENT] Please ignore",
                    body: "[TEST] You can safely ignore this notification.",
                    to: pushToken,
                    data: {
                        type: ENotificationType.NEW_EVENT,
                        screen: EAppScreens.NEW_EVENT,
                    },
                });
            }

            const expoPushTickets =
                await this.notificationService.sendPushNotifications(
                    notifications,
                );

            responseDTO = {
                ...responseDTO,
                ...(await countExpoPushTicketStatuses(expoPushTickets)),
            };
        } catch (err) {
            throw new InternalServerErrorException(err);
        }

        return responseDTO;
    }
}
