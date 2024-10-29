import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { OBaseNotification } from "@/transient-services/matching/matching.service.types";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
} from "@/types/user.types";
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
        @Inject(forwardRef(() => EncounterService))
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
     * @param userSendingLocationUpdate
     */
    public async findNearbyMatches(
        userSendingLocationUpdate: User,
    ): Promise<User[]> {
        if (!this.isUserEligibleForMatchingLookup(userSendingLocationUpdate)) {
            return [];
        }
        return this.userRepository.getPotentialMatchesForNotifications(
            userSendingLocationUpdate,
        );
    }

    /**
     * Sends a notification to users nearby
     * @param userSendingLocationUpdate
     */
    public async notifyMatches(userSendingLocationUpdate: User): Promise<void> {
        const nearbyMatches = await this.findNearbyMatches(
            userSendingLocationUpdate,
        );

        this.logger.debug(
            `Found ${nearbyMatches?.length ?? 0} for user ${userSendingLocationUpdate.id}`,
        );
        if (nearbyMatches?.length > 0) {
            const baseNotification: OBaseNotification = {
                sound: "default",
                title: this.i18n.t("main.notification.newMatch.title", {
                    args: { firstName: userSendingLocationUpdate.firstName },
                }),
                body: this.i18n.t("main.notification.newMatch.body"),
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson:
                        userSendingLocationUpdate.convertToPublicDTO(),
                },
            };

            // now save as encounters into DB
            const newEncounters =
                await this.encounterService.saveEncountersForUser(
                    userSendingLocationUpdate,
                    nearbyMatches,
                    true, // they are all nearby rn
                    true, // reset older encounters
                );

            this.logger.debug(
                `Saved ${newEncounters.size} new encounters for user ${userSendingLocationUpdate.id}`,
            );

            const notifications: OfflineryNotification[] = [];
            for (const user of nearbyMatches) {
                const encounter = newEncounters.get(user.id);

                // @dev Still sending new notifications if encounter status is MET_INTERESTED (because why not, multiple times to meet)
                if (encounter.status !== EEncounterStatus.MET_NOT_INTERESTED) {
                    if (
                        userSendingLocationUpdate.approachChoice ===
                        EApproachChoice.BE_APPROACHED
                    ) {
                        notifications.push({
                            ...baseNotification,
                            to: user.pushToken,
                            data: {
                                ...baseNotification.data,
                                encounterId: encounter.id,
                            },
                        });
                    } else {
                        // @dev Sending notification to user itself as he was the one sending the locationUpdate
                        notifications.push({
                            ...baseNotification,
                            to: userSendingLocationUpdate.pushToken,
                            data: {
                                ...baseNotification.data,
                                encounterId: newEncounters[user.id],
                            },
                        });
                    }
                } else {
                    this.logger.debug(
                        `Not sending notification for encounter ${encounter.id} as encounterStatus ${encounter.status}.`,
                    );
                }
            }

            console.log("sending! ", notifications);
            await this.notificationService.sendPushNotification(notifications);
            this.logger.debug(
                `Sent ${notifications.length} notifications for user ${userSendingLocationUpdate.id} (approachChoice: ${userSendingLocationUpdate.approachChoice})`,
            );
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
