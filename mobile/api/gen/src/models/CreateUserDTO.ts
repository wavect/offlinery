/* tslint:disable */
/* eslint-disable */
/**
 * Offlinery
 * API of Offlinery
 *
 * The version of the OpenAPI document: 1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { BlacklistedRegionDTO } from "./BlacklistedRegionDTO";
import {
    BlacklistedRegionDTOFromJSON,
    BlacklistedRegionDTOToJSON,
} from "./BlacklistedRegionDTO";

/**
 *
 * @export
 * @interface CreateUserDTO
 */
export interface CreateUserDTO {
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    firstName: string;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    email: string;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    clearPassword: string;
    /**
     *
     * @type {boolean}
     * @memberof CreateUserDTO
     */
    wantsEmailUpdates: boolean;
    /**
     *
     * @type {Date}
     * @memberof CreateUserDTO
     */
    birthDay: Date;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    gender: CreateUserDTOGenderEnum;
    /**
     *
     * @type {Array<string>}
     * @memberof CreateUserDTO
     */
    genderDesire: Array<CreateUserDTOGenderDesireEnum>;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    approachChoice: CreateUserDTOApproachChoiceEnum;
    /**
     *
     * @type {Array<string>}
     * @memberof CreateUserDTO
     */
    intentions: Array<CreateUserDTOIntentionsEnum>;
    /**
     * Array of blacklisted regions
     * @type {Array<BlacklistedRegionDTO>}
     * @memberof CreateUserDTO
     */
    blacklistedRegions?: Array<BlacklistedRegionDTO> | null;
    /**
     *
     * @type {Date}
     * @memberof CreateUserDTO
     */
    approachFromTime?: Date | null;
    /**
     *
     * @type {Date}
     * @memberof CreateUserDTO
     */
    approachToTime?: Date | null;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    bio?: string | null;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    dateMode: CreateUserDTODateModeEnum;
    /**
     *
     * @type {string}
     * @memberof CreateUserDTO
     */
    preferredLanguage: CreateUserDTOPreferredLanguageEnum;
}

/**
 * @export
 */
export const CreateUserDTOGenderEnum = {
    woman: "woman",
    man: "man",
} as const;
export type CreateUserDTOGenderEnum =
    (typeof CreateUserDTOGenderEnum)[keyof typeof CreateUserDTOGenderEnum];

/**
 * @export
 */
export const CreateUserDTOGenderDesireEnum = {
    woman: "woman",
    man: "man",
} as const;
export type CreateUserDTOGenderDesireEnum =
    (typeof CreateUserDTOGenderDesireEnum)[keyof typeof CreateUserDTOGenderDesireEnum];

/**
 * @export
 */
export const CreateUserDTOApproachChoiceEnum = {
    approach: "approach",
    be_approached: "be_approached",
    both: "both",
} as const;
export type CreateUserDTOApproachChoiceEnum =
    (typeof CreateUserDTOApproachChoiceEnum)[keyof typeof CreateUserDTOApproachChoiceEnum];

/**
 * @export
 */
export const CreateUserDTOIntentionsEnum = {
    friendship: "friendship",
    casual: "casual",
    relationship: "relationship",
    reconnect_friends: "reconnect_friends",
} as const;
export type CreateUserDTOIntentionsEnum =
    (typeof CreateUserDTOIntentionsEnum)[keyof typeof CreateUserDTOIntentionsEnum];

/**
 * @export
 */
export const CreateUserDTODateModeEnum = {
    ghost: "ghost",
    live: "live",
} as const;
export type CreateUserDTODateModeEnum =
    (typeof CreateUserDTODateModeEnum)[keyof typeof CreateUserDTODateModeEnum];

/**
 * @export
 */
export const CreateUserDTOPreferredLanguageEnum = {
    en: "en",
    de: "de",
} as const;
export type CreateUserDTOPreferredLanguageEnum =
    (typeof CreateUserDTOPreferredLanguageEnum)[keyof typeof CreateUserDTOPreferredLanguageEnum];

/**
 * Check if a given object implements the CreateUserDTO interface.
 */
export function instanceOfCreateUserDTO(value: object): value is CreateUserDTO {
    if (!("firstName" in value) || value["firstName"] === undefined)
        return false;
    if (!("email" in value) || value["email"] === undefined) return false;
    if (!("clearPassword" in value) || value["clearPassword"] === undefined)
        return false;
    if (
        !("wantsEmailUpdates" in value) ||
        value["wantsEmailUpdates"] === undefined
    )
        return false;
    if (!("birthDay" in value) || value["birthDay"] === undefined) return false;
    if (!("gender" in value) || value["gender"] === undefined) return false;
    if (!("genderDesire" in value) || value["genderDesire"] === undefined)
        return false;
    if (!("approachChoice" in value) || value["approachChoice"] === undefined)
        return false;
    if (!("intentions" in value) || value["intentions"] === undefined)
        return false;
    if (!("dateMode" in value) || value["dateMode"] === undefined) return false;
    if (
        !("preferredLanguage" in value) ||
        value["preferredLanguage"] === undefined
    )
        return false;
    return true;
}

export function CreateUserDTOFromJSON(json: any): CreateUserDTO {
    return CreateUserDTOFromJSONTyped(json, false);
}

export function CreateUserDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): CreateUserDTO {
    if (json == null) {
        return json;
    }
    return {
        firstName: json["firstName"],
        email: json["email"],
        clearPassword: json["clearPassword"],
        wantsEmailUpdates: json["wantsEmailUpdates"],
        birthDay: new Date(json["birthDay"]),
        gender: json["gender"],
        genderDesire: json["genderDesire"],
        approachChoice: json["approachChoice"],
        intentions: json["intentions"],
        blacklistedRegions:
            json["blacklistedRegions"] == null
                ? undefined
                : (json["blacklistedRegions"] as Array<any>).map(
                      BlacklistedRegionDTOFromJSON,
                  ),
        approachFromTime:
            json["approachFromTime"] == null
                ? undefined
                : new Date(json["approachFromTime"]),
        approachToTime:
            json["approachToTime"] == null
                ? undefined
                : new Date(json["approachToTime"]),
        bio: json["bio"] == null ? undefined : json["bio"],
        dateMode: json["dateMode"],
        preferredLanguage: json["preferredLanguage"],
    };
}

export function CreateUserDTOToJSON(value?: CreateUserDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        firstName: value["firstName"],
        email: value["email"],
        clearPassword: value["clearPassword"],
        wantsEmailUpdates: value["wantsEmailUpdates"],
        birthDay: value["birthDay"].toISOString().substring(0, 10),
        gender: value["gender"],
        genderDesire: value["genderDesire"],
        approachChoice: value["approachChoice"],
        intentions: value["intentions"],
        blacklistedRegions:
            value["blacklistedRegions"] == null
                ? undefined
                : (value["blacklistedRegions"] as Array<any>).map(
                      BlacklistedRegionDTOToJSON,
                  ),
        approachFromTime:
            value["approachFromTime"] == null
                ? undefined
                : (value["approachFromTime"] as any).toISOString(),
        approachToTime:
            value["approachToTime"] == null
                ? undefined
                : (value["approachToTime"] as any).toISOString(),
        bio: value["bio"],
        dateMode: value["dateMode"],
        preferredLanguage: value["preferredLanguage"],
    };
}
