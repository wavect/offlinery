export enum EGender {
    WOMAN = "woman",
    MAN = "man",
}

export enum EIntention {
    FRIENDSHIP = "friendship",
    CASUAL = "casual",
    RELATIONSHIP = "relationship",
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
    /** @dev Not needed if not approaching right now (e.g. women) */
    NOT_NEEDED = "not_needed",
}

/** @dev Dedicated Enum for email verification for separation of concerns */
export enum EEmailVerificationStatus {
    VERIFIED = "verified",
    PENDING = "pending",
}

export enum EIncidentType {
    Disrespectful = "Disrespectful",
    SexualHarassment = "Sexual harassment",
    Violent = "Violent behavior",
    Other = "Other",
}

export enum EEncounterStatus {
    NOT_MET = "not_met",
    MET_NOT_INTERESTED = "met_not_interested",
    MET_INTERESTED = "met_interested",
}
