export enum EGender {
    WOMAN = "woman",
    MAN = "man",
}

export enum EIntention {
    FRIENDSHIP = "friendship",
    CASUAL = "casual",
    RELATIONSHIP = "relationship",
    RECONNECT_FRIENDS = "reconnect_friends",
}

export enum EDateMode {
    GHOST = "ghost",
    LIVE = "live",
}

export enum EApproachChoice {
    APPROACH = "approach",
    BE_APPROACHED = "be_approached",
    BOTH = "both",
}

export enum ELanguage {
    en = "en",
    de = "de",
}

export enum EVerificationStatus {
    VERIFIED = "verified",
    PENDING = "pending",
    DENIED = "denied",
}

/** @dev Dedicated Enum for email verification for separation of concerns */
export enum EEmailVerificationStatus {
    VERIFIED = "verified",
    PENDING = "pending",
}

export enum EIncidentType {
    Disrespectful = "Disrespectful",
    CSAE = "Child Sexual Abuse",
    SexualHarassment = "Sexual harassment",
    Violent = "Violent behavior",
    Other = "Other",
}

export enum EEncounterStatus {
    NOT_MET = "not_met",
    MET_NOT_INTERESTED = "met_not_interested",
    MET_INTERESTED = "met_interested",
}
