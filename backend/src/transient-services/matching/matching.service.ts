import {Injectable} from '@nestjs/common';
import {User} from "../../user/user.entity";
import {OfflineryNotification} from "../notification/notification-message.type";
import {EAppScreens} from "../../DTOs/notification-navigate-user.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {NotificationService} from "../notification/notification.service";
import {EDateMode} from "../../types/user.types";
import {getAge} from "../../utils/date.utils";
import {BlacklistedRegion} from "../../blacklisted-region/blacklisted-region.entity";


@Injectable()
export class MatchingService {
    constructor(@InjectRepository(User)
                private userRepository: Repository<User>,
                @InjectRepository(BlacklistedRegion)
                private blacklistedRegionRepository: Repository<BlacklistedRegion>,
                private notificationService: NotificationService) {
    }

    private async findNearbyMatches(user: User): Promise<User[]> {
        if (!user || !user.location || user.dateMode !== EDateMode.LIVE) {
            return [];
        }

        // Check if user is within any of their blacklisted regions
        const isInBlacklistedRegion = await this.blacklistedRegionRepository.createQueryBuilder('region')
            .where('region.user = :userId', { userId: user.id })
            .andWhere('ST_DWithin(region.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, region.radius)', {
                lon: user.location.coordinates[0],
                lat: user.location.coordinates[1],
            })
            .getCount() > 0;

        if (isInBlacklistedRegion) {
            return [];
        }

        const userAge = getAge(user.birthDay);

        // TODO: This algorithm should be improved over time (e.g. age, etc. based on user settings, attractivity etc.)
        // TODO: age, distance, etc. should be configurable over time
        const nearbyUsers = await this.userRepository
            .createQueryBuilder('user')
            .where('user.id != :userId', {userId: user.id})
            .andWhere('user.gender = :desiredGender', {desiredGender: user.genderDesire})
            .andWhere('user.genderDesire = :userGender', {userGender: user.gender})
            .andWhere('user.dateMode = :liveMode', {liveMode: EDateMode.LIVE})
            .andWhere('ST_DWithin(user.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distance)', {
                lon: user.location.coordinates[0],
                lat: user.location.coordinates[1],
                distance: 750, // 750 meters
            })
            .andWhere('EXTRACT(YEAR FROM AGE(user.birthDay)) BETWEEN :minAge AND :maxAge', {
                minAge: userAge - 15,
                maxAge: userAge + 15
            })
            .getMany();

        return nearbyUsers;
    }

    async checkAndNotifyMatches(user: User): Promise<void> {
        const nearbyMatches = await this.findNearbyMatches(user);

        if (nearbyMatches.length > 0) {
            const notification: OfflineryNotification = {
                to: user.pushToken,
                sound: 'default',
                title: 'New Match Nearby!',
                body: `There's a potential match in your area!`,
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: user.convertToPublicDTO(),
                }
            };

            await this.notificationService.sendPushNotification(user.pushToken, [notification]);
        }
    }
}
