import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { GenericStatusDTO } from "@/DTOs/generic-status.dto";
import { GetLocationOfEncounterResponseDTO } from "@/DTOs/get-location-of-encounter-response.dto";
import { NotificationDidYouMeetDTO } from "@/DTOs/notifications/notification-did-you-meet";
import { NotificationNewMessageDTO } from "@/DTOs/notifications/notification-new-message.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { TaskService } from "@/transient-services/task/task.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EEncounterStatus, ELanguage } from "@/types/user.types";
import { formatMultiLanguageDateTimeStringsCET } from "@/utils/date.utils";
import {
    getPointFromTypedCoordinates,
    getTypedCoordinatesFromPoint,
} from "@/utils/location.utils";
import { MAX_ENCOUNTERS_PER_DAY_FOR_USER } from "@/utils/misc.utils";
import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    PreconditionFailedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { QueryRunner, Repository } from "typeorm";

@Injectable()
export class EncounterService {
    private readonly logger = new Logger(EncounterService.name);

    constructor(
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        protected readonly i18n: I18nService,
        @Inject(forwardRef(() => NotificationService))
        protected readonly notificationService: NotificationService,
        private taskService: TaskService,
    ) {}

    /** @dev Only used for debugging in dev environments.
     * Sends an encounter notification to the default account (office@wavect.io) with a test user. */
    async simulateEncounter(): Promise<GenericStatusDTO> {
        const user = await this.userRepository.findOneOrFail({
            where: { email: "office@wavect.io" },
            relations: { encounters: { users: true } },
        });

        const firstEncounter = user.encounters[0];
        if (!firstEncounter) {
            throw new NotFoundException("No encounter found.");
        }

        const otherUser = firstEncounter.users?.find((u) => u.id !== user.id);
        if (!otherUser) {
            throw new NotFoundException("Other user not found.");
        }

        firstEncounter.userStatuses = {
            [user.id]: EEncounterStatus.NOT_MET,
            [otherUser.id]: EEncounterStatus.NOT_MET,
        };
        firstEncounter.amountStreaks++;
        const getCloseLocation = getTypedCoordinatesFromPoint(user.location);
        firstEncounter.lastLocationPassedBy = getPointFromTypedCoordinates({
            latitude: getCloseLocation.latitude + 0.0003,
            longitude: getCloseLocation.longitude,
        });
        otherUser.location = getPointFromTypedCoordinates({
            latitude: getCloseLocation.latitude + 0.0004,
            longitude: getCloseLocation.longitude,
        });
        otherUser.locationLastTimeUpdated = new Date();
        user.locationLastTimeUpdated = new Date();
        firstEncounter.lastDateTimePassedBy = new Date();
        await this.userRepository.save(otherUser);
        await this.encounterRepository.save(firstEncounter);

        // final check, is user really nearby?
        const res = await this.userService.findUsersNearbyByUserIds(
            [otherUser.id],
            user.location,
        );

        if (!res.includes(otherUser.id)) {
            const msg = `Other user of first Encounter is not nearby right now: ${JSON.stringify(user.location.coordinates)} (user), ${JSON.stringify(otherUser.location.coordinates)}`;
            this.logger.error(msg);
            throw new PreconditionFailedException(msg);
        }
        this.logger.debug(
            `Locations: ${otherUser.location.coordinates} (otheruser), ${user.location.coordinates} (user), ${firstEncounter.lastLocationPassedBy.coordinates} (last passed)`,
        );
        this.logger.debug(
            `Updated encounter for simulation: ${firstEncounter.lastDateTimePassedBy}, ${firstEncounter.lastLocationPassedBy.coordinates}`,
        );

        const lang = ELanguage.en;
        const baseNotification =
            await this.notificationService.buildNewMatchBaseNotification(user);
        await this.notificationService.sendPushNotifications([
            {
                ...baseNotification,
                title: this.i18n.translate("main.notification.newMatch.title", {
                    args: {
                        firstName: otherUser.firstName,
                    },
                    lang,
                }),
                body: this.i18n.translate("main.notification.newMatch.body", {
                    args: {
                        firstName: otherUser.firstName,
                    },
                    lang,
                }),
                to: user.pushToken,
                data: {
                    ...baseNotification.data,
                    encounterId: firstEncounter.id,
                    navigateToPerson: otherUser.convertToPublicDTO(),
                },
            },
        ]);

        await this.scheduleOneTimeFollowUpTaskForEncounter(firstEncounter);

        return {
            success: true,
            info: "Encounter simulated.",
        };
    }

    async findEncountersByUser(
        userId: string,
        dateRange?: DateRangeDTO,
    ): Promise<Encounter[]> {
        let query = this.encounterRepository
            .createQueryBuilder("encounter")
            .innerJoinAndSelect("encounter.users", "user")
            .leftJoinAndSelect("encounter.userReports", "userReports")
            .leftJoinAndSelect("encounter.messages", "messages")
            .leftJoinAndSelect("messages.sender", "sender")
            .leftJoinAndSelect("encounter.users", "allUsers")
            /** @DEV CHANGE! */
            .where(
                ':userId IN (SELECT "userId" FROM user_encounters_encounter WHERE "encounterId" = encounter.id)',
                { userId },
            )
            .andWhere("userReports.id IS NULL")
            /// @dev This filters out encounters that have a deleted user. As of today we don't delete encounters with one deleted user.
            .andWhere(
                '(SELECT COUNT(*) FROM user_encounters_encounter WHERE "encounterId" = encounter.id) > 1',
            )
            .orderBy("encounter.lastDateTimePassedBy", "DESC");

        if (dateRange?.startDate && dateRange?.endDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy BETWEEN :startDate AND :endDate",
                {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                },
            );
        } else if (dateRange?.startDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy >= :startDate",
                {
                    startDate: dateRange.startDate,
                },
            );
        } else if (dateRange?.endDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy <= :endDate",
                {
                    endDate: dateRange.endDate,
                },
            );
        }

        // do not fail if none found
        return await query.getMany();
    }

    async getEncountersByUser(
        userId: string,
        startDate?: Date,
        endDate?: Date,
    ) {
        const [user, encounters] = await Promise.all([
            this.userService.findUserById(userId),
            this.findEncountersByUser(userId, {
                startDate,
                endDate,
            }),
        ]);

        if (!encounters?.length) {
            return [];
        }

        const otherUserIds = [];
        const userEncounters = encounters.map((encounter) => {
            const dto = encounter.convertToPublicDTO(user);

            // @dev Override general encounter status and return only the status from the user itself for the frontend.
            const userEncounterStatus = encounter.userStatuses[userId];
            if (userEncounterStatus) {
                dto.status = userEncounterStatus;
            } else {
                this.logger.error(
                    `Encounter status for user ${userId} not found! Returning general status.`,
                );
            }
            otherUserIds.push(dto.otherUser.id);
            return dto;
        });

        // Get nearby users and convert to Set for O(1) lookups
        const nearbyUsers = new Set(
            await this.userService.findUsersNearbyByUserIds(
                otherUserIds,
                user.location,
            ),
        );

        userEncounters.forEach((encounter) => {
            encounter.isNearbyRightNow = nearbyUsers.has(encounter.otherUser.id)
                ? true
                : null;
        });

        this.logger.debug(
            `Found ${encounters.length} encounters for user ${userId}`,
        );

        return userEncounters;
    }

    /**
     * @param userSendingLocationUpdate
     * @param userMatches
     *
     * that are not supplied to this function will be set to isNearbyRightNow=false as they are e.g. not supplied by the matching service. */
    async saveOrUpdateEncountersForUser(
        userSendingLocationUpdate: User,
        userMatches: User[],
    ): Promise<Map<string, Encounter>> {
        const encounters: Map<string, Encounter> = new Map();
        const queryRunner =
            this.encounterRepository.manager.connection.createQueryRunner();

        try {
            let userEncounterCount = await this.findCreatedEncountersPerDay(
                userSendingLocationUpdate.id,
            );

            for (const userMatch of userMatches) {
                if (userEncounterCount >= MAX_ENCOUNTERS_PER_DAY_FOR_USER) {
                    this.logger.debug(
                        `User ${userSendingLocationUpdate.id} has reached the daily encounter limit`,
                    );
                    break;
                }

                // @dev new encounters only created until limit, aborted due to if above.
                const encounter = await this.findOrCreateEncounterWithLock(
                    userSendingLocationUpdate.id,
                    userMatch.id,
                    queryRunner,
                );

                if (encounter.status !== EEncounterStatus.MET_NOT_INTERESTED) {
                    encounters.set(userMatch.id, encounter); // @dev which encounter to act on
                    userEncounterCount++; // @dev Abort condition for for loop
                }

                await this.scheduleOneTimeFollowUpTaskForEncounter(encounter);
            }

            return encounters;
        } finally {
            await queryRunner.release();
        }
    }

    async updateStatus(
        userId: string,
        updateStatusDTO: UpdateEncounterStatusDTO,
    ): Promise<Encounter> {
        const { encounterId, status } = updateStatusDTO;
        this.logger.debug(
            `User ${userId} is updating the encounterStatus of ${encounterId} to ${status}`,
        );

        const encounter = await this.encounterRepository.findOneBy({
            id: encounterId,
        });
        if (!encounter) {
            throw new NotFoundException(
                `Encounter with ID ${encounterId} not found`,
            );
        }

        encounter.setUserStatus(userId, status);
        return this.encounterRepository.save(encounter);
    }

    async getLocationOfEncounter(
        userId: string,
        encounterId: string,
    ): Promise<GetLocationOfEncounterResponseDTO> {
        this.logger.debug(
            `User ${userId} trying to access location for encounterId ${encounterId}`,
        );
        const encounter: Encounter = await this.encounterRepository.findOne({
            where: { id: encounterId },
            relations: ["users"],
        });
        if (!encounter) {
            const msg = `Encounter with ID ${encounterId} not found`;
            throw new NotFoundException(msg);
        }

        const currentUser = encounter.users.find((u) => u.id === userId);
        const otherUser = encounter.users.find((u) => u.id !== userId);
        if (!otherUser) {
            const msg = `Other user of Encounter ${encounterId} not found! Requesting user: ${userId}`;
            this.logger.error(msg);
            throw new NotFoundException(msg);
        }
        if (!otherUser.location) {
            const msg = `Other user of Encounter ${encounterId} has not location: ${otherUser.location}`;
            this.logger.error(msg);
            throw new PreconditionFailedException(msg); // @dev Only use this HTTP status code for when user is not nearby anymore (NavigateToScreen is listening on it)
        }

        // final check, is user really nearby?
        const res = await this.userService.findUsersNearbyByUserIds(
            [otherUser.id],
            currentUser.location,
        );

        if (!res.includes(otherUser.id)) {
            const msg = `Other user of Encounter ${encounterId} is not nearby right now: ${JSON.stringify(currentUser.location.coordinates)} (user), ${JSON.stringify(otherUser.location.coordinates)}`;
            this.logger.error(msg);
            throw new PreconditionFailedException(msg);
        }

        this.logger.debug(
            `User location: ${currentUser.location.coordinates}, Other user: ${otherUser.location.coordinates}`,
        );

        return {
            lastTimeLocationUpdated: otherUser.locationLastTimeUpdated,
            ...getTypedCoordinatesFromPoint(otherUser.location),
        };
    }

    private async findOrCreateEncounterWithLock(
        user1Id: string,
        user2Id: string,
        queryRunner: QueryRunner,
    ): Promise<Encounter> {
        await queryRunner.startTransaction();

        try {
            // Always lock users in a consistent order (by user ID) to prevent deadlocks
            const [smallerId, largerId] = [user1Id, user2Id].sort();

            // Lock users one at a time in consistent order
            const user1 = await queryRunner.manager
                .createQueryBuilder()
                .select("user")
                .from(User, "user")
                .where("user.id = :userId", { userId: smallerId })
                .setLock("pessimistic_write")
                .getOne();

            const user2 = await queryRunner.manager
                .createQueryBuilder()
                .select("user")
                .from(User, "user")
                .where("user.id = :userId", { userId: largerId })
                .setLock("pessimistic_write")
                .getOne();

            if (!user1 || !user2) {
                throw new NotFoundException("One or both users not found");
            }

            // Get encounters with these users
            const encounters = await queryRunner.manager
                .createQueryBuilder(Encounter, "encounter")
                .innerJoinAndSelect("encounter.users", "users")
                .where("users.id IN (:...userIds)", {
                    userIds: [smallerId, largerId],
                })
                .setLock("pessimistic_write")
                .getMany();

            // Find existing encounter with both users
            const existingEncounter = encounters.find((encounter) => {
                const userIds = new Set(encounter.users.map((u) => u.id));
                return userIds.has(smallerId) && userIds.has(largerId);
            });

            if (existingEncounter) {
                existingEncounter.lastDateTimePassedBy = new Date();
                existingEncounter.lastLocationPassedBy =
                    user1.id === user1Id ? user1.location : user2.location;
                existingEncounter.amountStreaks++;

                const savedEncounter = await queryRunner.manager.save(
                    Encounter,
                    existingEncounter,
                );
                await queryRunner.commitTransaction();
                return savedEncounter;
            }

            // Create new encounter
            const newEncounter = new Encounter();
            newEncounter.users = [user1, user2];
            newEncounter.lastDateTimePassedBy = new Date();
            newEncounter.lastLocationPassedBy =
                user1.id === user1Id ? user1.location : user2.location;
            newEncounter.setUserStatus(user1.id, EEncounterStatus.NOT_MET);
            newEncounter.setUserStatus(user2.id, EEncounterStatus.NOT_MET);

            const savedEncounter = await queryRunner.manager.save(
                Encounter,
                newEncounter,
            );
            await queryRunner.commitTransaction();
            return savedEncounter;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }

    private buildFollowUpNotification = (
        encounter: Encounter,
        user: User,
        otherUser: User,
    ): OfflineryNotification => {
        const lang = user.preferredLanguage ?? ELanguage.en;
        const { date, time } = formatMultiLanguageDateTimeStringsCET(
            encounter.lastDateTimePassedBy,
            lang,
        );

        const data: NotificationDidYouMeetDTO = {
            type: ENotificationType.DID_YOU_MEET,
            screen: EAppScreens.DID_YOU_MEET,
            encounterId: encounter.id,
        };

        return {
            sound: "default" as const,
            title: this.i18n.t(
                `main.notification.${ENotificationType.DID_YOU_MEET}.title`,
                {
                    args: {
                        firstName: otherUser.firstName,
                    },
                    lang,
                },
            ),
            body: this.i18n.t(
                `main.notification.${ENotificationType.DID_YOU_MEET}.body`,
                {
                    args: {
                        lastDatePassedBy: date,
                        lastTimePassedBy: time,
                        streakCount: encounter.amountStreaks,
                    },
                    lang,
                },
            ),
            to: user.pushToken,
            // For iOS
            categoryId: ENotificationType.DID_YOU_MEET,
            // For Android
            channelId: ENotificationType.DID_YOU_MEET,
            data,
        };
    };

    private async scheduleOneTimeFollowUpTaskForEncounter(
        encounter: Encounter,
    ): Promise<void> {
        try {
            const task = async () => {
                if (encounter.users?.length < 2) {
                    this.logger.error(
                        `Cannot schedule follow up task for encounter since encounter has not 2 users: ${encounter.users.length} (${encounter.id})`,
                    );
                    return;
                }
                const user1 = encounter.users[0];
                const user2 = encounter.users[1];

                const notifications = [
                    this.buildFollowUpNotification(encounter, user1, user2),
                    this.buildFollowUpNotification(encounter, user2, user1),
                ];

                const tickets =
                    await this.notificationService.sendPushNotifications(
                        notifications,
                    );
                this.logger.debug(
                    `Sent follow up notifications for encounter ${encounter.id} to both users with status: ${tickets.map((t) => t.status)}`,
                );
            };
            const taskId =
                this.taskService.generateUniqueDeterministicTaskId(encounter);
            await this.taskService.createOneTimeTask(
                taskId,
                task,
                3 * 60 * 60 * 1_000, // @dev 3 hours
            );
            this.logger.debug(
                `Scheduled follow up notification task for encounter ${encounter.id}`,
            );
        } catch (error) {
            this.logger.error(
                `Could not schedule follow up task for encounter ${encounter.id} due to ${error?.message ?? JSON.stringify(error)}`,
            );
        }
    }

    async pushMessage(
        userId: string,
        pushMessageDTO: PushMessageDTO,
    ): Promise<Encounter> {
        const { encounterId, content } = pushMessageDTO;
        this.logger.debug(
            `User ${userId} just wrote a message with encounterId ${encounterId}`,
        );

        const encounter = await this.encounterRepository.findOne({
            where: { id: encounterId },
            relations: { messages: { sender: true }, users: true },
        });
        if (!encounter) {
            throw new NotFoundException(
                `Encounter with ID ${encounterId} not found`,
            );
        }

        encounter.messages = encounter.messages.filter(
            (m) => m.sender.id !== userId,
        );

        const newMessage = this.messageRepository.create({
            content,
            sentAt: new Date(),
            sender: { id: userId },
            encounter,
        });

        await this.messageRepository.save(newMessage);
        encounter.messages.push(newMessage);

        const user: User = encounter.users.find((u) => u.id === userId);
        const otherUser: User = encounter.users.find((u) => u.id !== userId);

        try {
            if (
                otherUser?.pushToken &&
                user &&
                encounter.status !== EEncounterStatus.MET_NOT_INTERESTED
            ) {
                const data: NotificationNewMessageDTO = {
                    type: ENotificationType.NEW_MESSAGE,
                    screen: EAppScreens.NEW_MESSAGE,
                };

                const lang = otherUser.preferredLanguage ?? ELanguage.en;
                const notification = {
                    sound: "default" as const,
                    title: this.i18n.t(`main.notification.new_message.title`, {
                        args: {
                            firstName: user.firstName,
                        },
                        lang,
                    }),
                    body: newMessage.content,
                    to: otherUser.pushToken,
                    data,
                };
                await this.notificationService.sendPushNotifications([
                    notification,
                ]);
            } else {
                this.logger.warn(
                    `Cannot send push notification for user ${userId} to notify about new user message because no pushToken.`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Could not send push notification for message from user ${otherUser.id} to notify about new chat message: ${error?.message}`,
            );
        }

        return await this.encounterRepository.save(encounter);
    }

    private async findCreatedEncountersPerDay(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const encounterCount = await this.userRepository
            .createQueryBuilder("user")
            .innerJoin("user.encounters", "encounter")
            .where("user.id = :userId", { userId })
            .andWhere("encounter.lastDateTimePassedBy >= :today", { today })
            .andWhere("encounter.lastDateTimePassedBy < :tomorrow", {
                tomorrow,
            })
            .groupBy("user.id")
            .select("COUNT(encounter.id)", "count")
            .getRawOne();

        const count = parseInt(encounterCount?.count || "0");

        this.logger.log(`User ${userId} has created ${count} encounters today`);

        return count;
    }
}
