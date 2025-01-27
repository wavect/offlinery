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
import { formatMultiLanguageDateTimeStringsCET } from "@/utils/date.utils";
import { countExpoPushTicketStatuses } from "@/utils/misc.utils";
import { MailerService } from "@nestjs-modules/mailer";
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
        private readonly mailService: MailerService,
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
                const lang = user.preferredLanguage ?? defaultLang;
                const venueWithArticleIfNeeded: string =
                    newEvent.venueWithArticleIfNeeded.translations[lang] ??
                    newEvent.venueWithArticleIfNeeded.translations[defaultLang];

                const address: string =
                    newEvent.address.translations[lang] ??
                    newEvent.address.translations[defaultLang];

                const { date, time: startTime } =
                    formatMultiLanguageDateTimeStringsCET(
                        newEvent.eventStartDateTime,
                        lang,
                    );
                const { time: endTime } = formatMultiLanguageDateTimeStringsCET(
                    newEvent.eventEndDateTime,
                    lang,
                );

                notifications.push({
                    sound: "default" as const,
                    title: await this.i18n.translate(
                        `main.notification.new_event.title`,
                        { lang, args: { venueWithArticleIfNeeded } },
                    ),
                    body: await this.i18n.translate(
                        `main.notification.new_event.body`,
                        { lang, args: { date, startTime, endTime } },
                    ),
                    to: user.pushToken,
                    data: {
                        type: ENotificationType.NEW_EVENT,
                        screen: EAppScreens.NEW_EVENT,
                    },
                });

                await this.mailService.sendMail({
                    to: user.email,
                    subject: await this.i18n.translate(
                        `main.email.new-event.subject`,
                        { lang },
                    ),
                    template: `new-event`,
                    context: {
                        firstName: user.firstName,
                        venueWithArticleIfNeeded,
                        address,
                        date,
                        startTime,
                        endTime,
                        mapsLink: newEvent.mapsLink,
                        languageId: lang,
                        t: (key: string, params?: Record<string, any>) =>
                            this.i18n.translate(`main.email.new-event.${key}`, {
                                lang,
                                args: { ...(params?.hash ?? params) },
                            }),
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
        newEventEntity.venueWithArticleIfNeeded =
            await this.multilingualStringService.createTranslations(
                newEvent.venueWithArticleIfNeeded,
                newEventEntity.LBL_VENUE_WITH_ARTICLE_IF_NEEDED,
                newEventEntity.entityType,
                newEventEntity.id,
            );

        newEventEntity.address =
            await this.multilingualStringService.createTranslations(
                newEvent.address,
                newEventEntity.LBL_ADDRESS,
                newEventEntity.entityType,
                newEventEntity.id,
            );
        newEventEntity.eventStartDateTime = newEvent.eventStartDateTime;
        newEventEntity.eventEndDateTime = newEvent.eventEndDateTime;
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
