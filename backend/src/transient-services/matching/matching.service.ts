import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { OBaseNotification } from "@/transient-services/matching/matching.service.types";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EDateMode } from "@/types/user.types";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class MatchingService {
    private readonly logger = new Logger(MatchingService.name);

    constructor(
        private readonly i18n: I18nService<I18nTranslations>,
        private userRepository: UserRepository,
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService,
        private encounterService: EncounterService,
    ) {}

    public async findPotentialMatchesForHeatmap(
        userToBeApproached: User,
    ): Promise<User[]> {
        if (
            !userToBeApproached ||
            !userToBeApproached.location ||
            userToBeApproached.dateMode !== EDateMode.LIVE
        ) {
            this.logger.debug(
                `Not returning any nearbyMatches as user is not sharing his location right now: ${userToBeApproached.id} (dateMode: ${userToBeApproached.dateMode})`,
            );
            return [];
        }

        return this.userRepository.getPotentialMatchesForHeatMap(
            userToBeApproached,
        );
    }

    public async checkAndNotifyMatches(
        userToBeApproached: User,
    ): Promise<void> {
        let nearbyMatches: Map<string, User>;
        if (
            !userToBeApproached ||
            !userToBeApproached.location ||
            userToBeApproached.dateMode !== EDateMode.LIVE
        ) {
            this.logger.debug(
                `Not returning any nearbyMatches as user is not sharing his location right now: ${userToBeApproached.id} (dateMode: ${userToBeApproached.dateMode})`,
            );
            nearbyMatches = new Map();
        } else {
            nearbyMatches =
                await this.userRepository.getPotentialMatchesForNotifications(
                    userToBeApproached,
                );
        }

        if (nearbyMatches.size > 0) {
            const baseNotification: OBaseNotification = {
                sound: "default",
                title: this.i18n.t("main.notification.newMatch.title", {
                    args: { firstName: userToBeApproached.firstName },
                }),
                body: this.i18n.t("main.notification.newMatch.body"),
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: userToBeApproached.convertToPublicDTO(),
                },
            };

            const usersThatWantToApproach: User[] = [];
            const notifications: OfflineryNotification[] = [];
            for (const [encounterId, user] of nearbyMatches.entries()) {
                notifications.push({
                    ...baseNotification,
                    to: user.pushToken,
                    data: {
                        ...baseNotification.data,
                        encounterId,
                    },
                });
                usersThatWantToApproach.push(user);
            }

            await this.notificationService.sendPushNotification(notifications);

            // now save as encounters into DB
            await this.encounterService.saveEncountersForUser(
                userToBeApproached,
                usersThatWantToApproach,
                true, // they are all nearby rn
                true, // reset older encounters
            );
        }
    }
}
