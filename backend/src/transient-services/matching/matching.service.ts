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

    /**
     * Returns HeatMap locations for the given
     * @param userToBeApproached
     */
    public async findHeatmapMatches(userToBeApproached: User): Promise<User[]> {
        if (!this.isUserEligibleForMatchingLookup(userToBeApproached)) {
            return [];
        }
        return this.userRepository.getPotentialMatchesForHeatMap(
            userToBeApproached,
        );
    }

    /**
     * Returns matches for the given
     * @param userToBeApproached
     */
    public async findNearbyMatches(userToBeApproached: User): Promise<User[]> {
        if (!this.isUserEligibleForMatchingLookup(userToBeApproached)) {
            return [];
        }
        return this.userRepository.getPotentialMatchesForNotifications(
            userToBeApproached,
        );
    }

    /**
     * Sends a notification to users nearby
     * @param userToBeApproached
     */
    public async notifyMatches(userToBeApproached: User): Promise<void> {
        const nearbyMatches = await this.findNearbyMatches(userToBeApproached);

        if (nearbyMatches?.length > 0) {
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

            // now save as encounters into DB
            const newEncounters =
                await this.encounterService.saveEncountersForUser(
                    userToBeApproached,
                    nearbyMatches,
                    true, // they are all nearby rn
                    true, // reset older encounters
                );

            const notifications: OfflineryNotification[] = [];
            for (const user of nearbyMatches) {
                notifications.push({
                    ...baseNotification,
                    to: user.pushToken,
                    data: {
                        ...baseNotification.data,
                        encounterId: newEncounters[user.id],
                    },
                });
            }

            await this.notificationService.sendPushNotification(notifications);
        }
    }

    private isUserEligibleForMatchingLookup(userToBeApproached: User): boolean {
        if (
            !userToBeApproached ||
            !userToBeApproached.location ||
            userToBeApproached.dateMode !== EDateMode.LIVE
        ) {
            this.logger.debug(
                `User is not eligible for matching: ${userToBeApproached?.id} (dateMode: ${userToBeApproached?.dateMode})`,
            );
            return false;
        }
        return true;
    }
}
