import { NotificationNavigateUserDTO } from "@/DTOs/notifications/notification-navigate-user.dto";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { ClusteringService } from "@/transient-services/clustering/cluster.service";
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
        private clusterService: ClusteringService,
    ) {}

    /**
     * Returns HeatMap locations for the given
     * @param userToBeApproached
     */
    public async findHeatmapMatches(userToBeApproached: User): Promise<User[]> {
        const matches =
            await this.userRepository.getPotentialMatchesForHeatMap(
                userToBeApproached,
            );
        return matches ?? [];
    }

    public async findTemporaryHeatmap(
        userToBeApproached: User,
    ): Promise<User[]> {
        // TODO: Once enough users delete this function and switch back to findHeatmapMatches() function back which only shows matching users
        const matches =
            await this.userRepository.getHeatmapTEMPORARY(userToBeApproached);
        return matches ?? [];
    }

    public async getHeatMapClusteredPoints(userToBeApproached: User) {
        // TODO: Once enough users delete the temporary function and switch back to findHeatmapMatches() function back which only shows matching users
        const matches = await this.findTemporaryHeatmap(userToBeApproached);
        const realPoints = matches
            .filter((match: User) => !!match.location)
            .map((m) => m.location);
        return this.clusterService.getClusteredPoints(realPoints);
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
     * Checks for encounters and returns the notifications
     * @param userSendingLocationUpdate
     */
    public async checkForEncounters(
        userSendingLocationUpdate: User,
    ): Promise<OfflineryNotification[]> {
        const nearbyMatches = await this.findNearbyMatches(
            userSendingLocationUpdate,
        );

        const userLanguage =
            userSendingLocationUpdate.preferredLanguage ?? "en";

        this.logger.debug(
            `Found ${nearbyMatches?.length ?? 0} for user ${userSendingLocationUpdate.id}`,
        );

        if (nearbyMatches?.length > 0) {
            const baseNotification =
                await this.notificationService.buildNewMatchBaseNotification(
                    userSendingLocationUpdate,
                );

            // now save as encounters into DB
            const encounters =
                await this.encounterService.saveOrUpdateEncountersForUser(
                    userSendingLocationUpdate,
                    nearbyMatches,
                );

            if (!encounters?.size) {
                this.logger.log(
                    `No encounter were saved or updated. Reached daily encounter limit for user or already matched`,
                );
                return [];
            }

            this.logger.debug(
                `Saved/Updated ${encounters.size} encounters for user ${userSendingLocationUpdate.id}`,
            );

            const notifications: OfflineryNotification[] = [];

            for (const userNearBy of nearbyMatches) {
                const encounter = encounters.get(userNearBy.id);

                // @dev Still sending new notifications if encounter status is MET_INTERESTED (because why not, multiple times to meet)
                if (encounter.status !== EEncounterStatus.MET_NOT_INTERESTED) {
                    if (
                        userNearBy.approachChoice ===
                            EApproachChoice.APPROACH ||
                        userNearBy.approachChoice === EApproachChoice.BOTH
                    ) {
                        const data: NotificationNavigateUserDTO = {
                            ...(baseNotification.data as any), // TODO: fix this type (type derivation issue, but content should be ok)
                            encounterId: encounter.id,
                            navigateToPerson:
                                userSendingLocationUpdate.convertToPublicDTO(),
                        };
                        // Notify the other user
                        notifications.push({
                            ...baseNotification,
                            to: userNearBy.pushToken,
                            data,
                        });
                    }

                    if (
                        userSendingLocationUpdate.approachChoice ===
                            EApproachChoice.APPROACH ||
                        userSendingLocationUpdate.approachChoice ===
                            EApproachChoice.BOTH
                    ) {
                        // Notify the user who sent the location update
                        notifications.push({
                            ...baseNotification,
                            title: this.i18n.translate(
                                "main.notification.newMatch.title",
                                {
                                    args: {
                                        firstName: userNearBy.firstName,
                                    },
                                    lang: userLanguage,
                                },
                            ),
                            body: this.i18n.translate(
                                "main.notification.newMatch.body",
                                {
                                    args: {
                                        firstName: userNearBy.firstName,
                                    },
                                    lang: userLanguage,
                                },
                            ),
                            to: userSendingLocationUpdate.pushToken,
                            data: {
                                ...baseNotification.data,
                                encounterId: encounter.id,
                                navigateToPerson:
                                    userNearBy.convertToPublicDTO(),
                            },
                        });
                    }
                } else {
                    this.logger.debug(
                        `Not sending notification for encounter ${encounter.id} as encounterStatus ${encounter.status}.`,
                    );
                }
            }

            return notifications;
        } else {
            return [];
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
