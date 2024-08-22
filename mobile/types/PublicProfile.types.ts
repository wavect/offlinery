import {EncounterStatusEnum} from "../api/gen/src";

export interface IEncounterProfile {
    encounterId: string
    firstName: string
    age: string
    bio: string
    imageURIs: string[]
    rating?: number
    personalRelationship?: IProfileRelationship
}

export interface IProfileRelationship {
    isNearbyRightNow: boolean
    status: EncounterStatusEnum
    /** @dev Last time both have been nearby regardless whether they actually met, might just be calculated by backend "4 days ago"|"2 hours ago" */
    lastTimePassedBy: string
    /** Before we go for LatLng here, we might just return a readable string from the backend */
    lastLocationPassedBy: string
    reported: boolean
}