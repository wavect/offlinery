
export interface IPublicProfile {
    firstName: string
    age: string
    mainImageURI: string
    rating?: number
    personalRelationship?: IProfileRelationship
}

export enum EDateStatus {
    NOT_MET ="not_met",
    MET_NOT_INTERESTED = "met_not_interested",
    MET_INTERESTED = "met_interested",
}

export interface IProfileRelationship {
    status: EDateStatus
    /** @dev Last time both have been nearby regardless whether they actually met */
    lastTimePassedBy?: Date
}