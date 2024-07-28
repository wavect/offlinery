export interface IEncounterProfile {
    encounterId: string
    firstName: string
    age: string
    mainImageURI: string
    rating?: number
    personalRelationship?: IProfileRelationship
}

export interface IPublicProfile {
    firstName: string
    age: string
    bio: string
    mainImageURI: string
}

export enum EDateStatus {
    NOT_MET ="not_met",
    MET_NOT_INTERESTED = "met_not_interested",
    MET_INTERESTED = "met_interested",
}

export interface IProfileRelationship {
    status: EDateStatus
    /** @dev Last time both have been nearby regardless whether they actually met, might just be calculated by backend "4 days ago"|"2 hours ago" */
    lastTimePassedBy: string
    /** Before we go for LatLng here, we might just return a readable string from the backend */
    lastLocationPassedBy: string
    reported: boolean
}