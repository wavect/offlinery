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

import { mapValues } from '../runtime';
import type { Time } from './Time';
import {
    TimeFromJSON,
    TimeFromJSONTyped,
    TimeToJSON,
} from './Time';

/**
 * 
 * @export
 * @interface UserPublicDTO
 */
export interface UserPublicDTO {
    /**
     * The unique identifier of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    id: string;
    /**
     * Indicates if the user account is active
     * @type {boolean}
     * @memberof UserPublicDTO
     */
    isActive: boolean;
    /**
     * The first name of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    firstName: string;
    /**
     * Indicates if the user wants to receive email updates
     * @type {boolean}
     * @memberof UserPublicDTO
     */
    wantsEmailUpdates: boolean;
    /**
     * The birth date of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    birthDay: string;
    /**
     * The gender of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    gender: UserPublicDTOGenderEnum;
    /**
     * The gender the user is interested in
     * @type {string}
     * @memberof UserPublicDTO
     */
    genderDesire: UserPublicDTOGenderDesireEnum;
    /**
     * An array of image files
     * @type {Array<string>}
     * @memberof UserPublicDTO
     */
    imageURIs: Array<string>;
    /**
     * The verification status of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    verificationStatus: UserPublicDTOVerificationStatusEnum;
    /**
     * The approach choice of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    approachChoice: UserPublicDTOApproachChoiceEnum;
    /**
     * The time from which the user can be approached
     * @type {Time}
     * @memberof UserPublicDTO
     */
    approachFromTime: Time;
    /**
     * The time until which the user can be approached
     * @type {Date}
     * @memberof UserPublicDTO
     */
    approachToTime: Date;
    /**
     * The user's bio
     * @type {string}
     * @memberof UserPublicDTO
     */
    bio: string;
    /**
     * The date mode of the user
     * @type {string}
     * @memberof UserPublicDTO
     */
    dateMode: UserPublicDTODateModeEnum;
}


/**
 * @export
 */
export const UserPublicDTOGenderEnum = {
    Woman: 'woman',
    Man: 'man'
} as const;
export type UserPublicDTOGenderEnum = typeof UserPublicDTOGenderEnum[keyof typeof UserPublicDTOGenderEnum];

/**
 * @export
 */
export const UserPublicDTOGenderDesireEnum = {
    Woman: 'woman',
    Man: 'man'
} as const;
export type UserPublicDTOGenderDesireEnum = typeof UserPublicDTOGenderDesireEnum[keyof typeof UserPublicDTOGenderDesireEnum];

/**
 * @export
 */
export const UserPublicDTOVerificationStatusEnum = {
    Verified: 'verified',
    Pending: 'pending',
    NotNeeded: 'not_needed'
} as const;
export type UserPublicDTOVerificationStatusEnum = typeof UserPublicDTOVerificationStatusEnum[keyof typeof UserPublicDTOVerificationStatusEnum];

/**
 * @export
 */
export const UserPublicDTOApproachChoiceEnum = {
    Approach: 'approach',
    BeApproached: 'be_approached',
    Both: 'both'
} as const;
export type UserPublicDTOApproachChoiceEnum = typeof UserPublicDTOApproachChoiceEnum[keyof typeof UserPublicDTOApproachChoiceEnum];

/**
 * @export
 */
export const UserPublicDTODateModeEnum = {
    Ghost: 'ghost',
    Live: 'live'
} as const;
export type UserPublicDTODateModeEnum = typeof UserPublicDTODateModeEnum[keyof typeof UserPublicDTODateModeEnum];


/**
 * Check if a given object implements the UserPublicDTO interface.
 */
export function instanceOfUserPublicDTO(value: object): value is UserPublicDTO {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('isActive' in value) || value['isActive'] === undefined) return false;
    if (!('firstName' in value) || value['firstName'] === undefined) return false;
    if (!('wantsEmailUpdates' in value) || value['wantsEmailUpdates'] === undefined) return false;
    if (!('birthDay' in value) || value['birthDay'] === undefined) return false;
    if (!('gender' in value) || value['gender'] === undefined) return false;
    if (!('genderDesire' in value) || value['genderDesire'] === undefined) return false;
    if (!('imageURIs' in value) || value['imageURIs'] === undefined) return false;
    if (!('verificationStatus' in value) || value['verificationStatus'] === undefined) return false;
    if (!('approachChoice' in value) || value['approachChoice'] === undefined) return false;
    if (!('approachFromTime' in value) || value['approachFromTime'] === undefined) return false;
    if (!('approachToTime' in value) || value['approachToTime'] === undefined) return false;
    if (!('bio' in value) || value['bio'] === undefined) return false;
    if (!('dateMode' in value) || value['dateMode'] === undefined) return false;
    return true;
}

export function UserPublicDTOFromJSON(json: any): UserPublicDTO {
    return UserPublicDTOFromJSONTyped(json, false);
}

export function UserPublicDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserPublicDTO {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'isActive': json['isActive'],
        'firstName': json['firstName'],
        'wantsEmailUpdates': json['wantsEmailUpdates'],
        'birthDay': json['birthDay'],
        'gender': json['gender'],
        'genderDesire': json['genderDesire'],
        'imageURIs': json['imageURIs'],
        'verificationStatus': json['verificationStatus'],
        'approachChoice': json['approachChoice'],
        'approachFromTime': TimeFromJSON(json['approachFromTime']),
        'approachToTime': (new Date(json['approachToTime'])),
        'bio': json['bio'],
        'dateMode': json['dateMode'],
    };
}

export function UserPublicDTOToJSON(value?: UserPublicDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'isActive': value['isActive'],
        'firstName': value['firstName'],
        'wantsEmailUpdates': value['wantsEmailUpdates'],
        'birthDay': value['birthDay'],
        'gender': value['gender'],
        'genderDesire': value['genderDesire'],
        'imageURIs': value['imageURIs'],
        'verificationStatus': value['verificationStatus'],
        'approachChoice': value['approachChoice'],
        'approachFromTime': TimeToJSON(value['approachFromTime']),
        'approachToTime': ((value['approachToTime']).toISOString()),
        'bio': value['bio'],
        'dateMode': value['dateMode'],
    };
}

