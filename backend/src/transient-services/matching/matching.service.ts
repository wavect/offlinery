import {Injectable} from '@nestjs/common';
import {User} from "../../user/user.entity";
import {OfflineryNotification} from "../notification/notification-message.type";
import {EAppScreens} from "../../DTOs/notification-navigate-user.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {NotificationService} from "../notification/notification.service";

@Injectable()
export class MatchingService {
    constructor(@InjectRepository(User)
                private userRepository: Repository<User>,
                private notificationService: NotificationService) {
    }

    private async findNearbyMatches(user: User): Promise<User[]> {
        if (!user || !user.location) {
            return [];
        }

        // TODO: This algorithm should be improved over time (e.g. age, etc. based on user settings, attractivity etc.)
        const nearbyUsers = await this.userRepository
            .createQueryBuilder('user')
            .where('user.id != :userId', {userId: user.id})
            .andWhere('user.gender = :desiredGender', {desiredGender: user.genderDesire})
            .andWhere('ST_DWithin(user.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distance)', {
                lon: user.location.coordinates[0],
                lat: user.location.coordinates[1],
                distance: 750, // 750 meters
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
