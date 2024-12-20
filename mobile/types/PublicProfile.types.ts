// TODO: Can we get rid of this type?
import { EncounterPublicDTOStatusEnum, MessagePublicDTO, UserPublicDTOIntentionsEnum } from "@/api/gen/src";

export interface IEncounterProfile {
    encounterId: string;
    firstName: string;
    age: number;
    bio: string;
    imageURIs: string[];
    rating?: number;
    intentions: UserPublicDTOIntentionsEnum[];
    crossedPathStreak?: number;

    isNearbyRightNow?: boolean;
    status?: EncounterPublicDTOStatusEnum;
    /** @dev Last time both have been nearby regardless whether they actually met, might just be calculated by backend "4 days ago"|"2 hours ago" */
    lastTimePassedBy?: string;
    /** Before we go for LatLng here, we might just return a readable string from the backend */
    lastLocationPassedBy?: string;
    reported?: boolean;
    /** @dev Custom message or contact details the other user sent to this user (one time message for now) */
    lastReceivedMessage?: MessagePublicDTO;
}
