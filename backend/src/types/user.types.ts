
export enum EGender {
    WOMAN = "woman",
    MAN = "man",
}

export enum EDateMode {
    GHOST = "ghost",
    LIVE = "live",
}

export enum EApproachChoice {
    APPROACH = "approach",
    BE_APPROACHED = "be_approached",
    BOTH = "both"
}

export enum EVerificationStatus {
    VERIFIED = "verified",
    PENDING = "pending",
    /** @dev Not needed if not approaching right now (e.g. women) */
    NOT_NEEDED = "not_needed",
}

// TODO: Maybe to own entity?
interface LatLng {
    latitude: number;
    longitude: number;
}

export enum EIncidentType {
    Disrespectful = 'Disrespectful',
    SexualHarassment = 'Sexual harassment',
    Violent = 'Violent behavior',
    Other = 'Other',
}

export enum EEncounterStatus {
    NOT_MET ="not_met",
    MET_NOT_INTERESTED = "met_not_interested",
    MET_INTERESTED = "met_interested",
}