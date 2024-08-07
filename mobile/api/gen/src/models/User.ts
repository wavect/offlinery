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
import type { UserReport } from './UserReport';
import {
    UserReportFromJSON,
    UserReportFromJSONTyped,
    UserReportToJSON,
} from './UserReport';
import type { BlacklistedRegion } from './BlacklistedRegion';
import {
    BlacklistedRegionFromJSON,
    BlacklistedRegionFromJSONTyped,
    BlacklistedRegionToJSON,
} from './BlacklistedRegion';

/**
 * 
 * @export
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {string}
     * @memberof User
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof User
     */
    isActive: boolean;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    firstName: string;
    /**
     * 
     * @type {boolean}
     * @memberof User
     */
    wantsEmailUpdates: boolean;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    passwordHash: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    passwordSalt: string;
    /**
     * 
     * @type {Date}
     * @memberof User
     */
    birthDay: Date;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    gender: UserGenderEnum;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    genderDesire: UserGenderDesireEnum;
    /**
     * 
     * @type {Array<string>}
     * @memberof User
     */
    imageURIs: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    verificationStatus: UserVerificationStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    approachChoice: UserApproachChoiceEnum;
    /**
     * 
     * @type {Array<BlacklistedRegion>}
     * @memberof User
     */
    blacklistedRegions: Array<BlacklistedRegion>;
    /**
     * 
     * @type {Date}
     * @memberof User
     */
    approachFromTime: Date;
    /**
     * 
     * @type {Date}
     * @memberof User
     */
    approachToTime: Date;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    bio: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    dateMode: UserDateModeEnum;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    pushToken: string;
    /**
     * 
     * @type {Array<UserReport>}
     * @memberof User
     */
    receivedReports: Array<UserReport>;
    /**
     * 
     * @type {Array<UserReport>}
     * @memberof User
     */
    issuedReports: Array<UserReport>;
}


/**
 * @export
 */
export const UserGenderEnum = {
    woman: 'woman',
    man: 'man'
} as const;
export type UserGenderEnum = typeof UserGenderEnum[keyof typeof UserGenderEnum];

/**
 * @export
 */
export const UserGenderDesireEnum = {
    woman: 'woman',
    man: 'man'
} as const;
export type UserGenderDesireEnum = typeof UserGenderDesireEnum[keyof typeof UserGenderDesireEnum];

/**
 * @export
 */
export const UserVerificationStatusEnum = {
    verified: 'verified',
    pending: 'pending',
    not_needed: 'not_needed'
} as const;
export type UserVerificationStatusEnum = typeof UserVerificationStatusEnum[keyof typeof UserVerificationStatusEnum];

/**
 * @export
 */
export const UserApproachChoiceEnum = {
    approach: 'approach',
    be_approached: 'be_approached',
    both: 'both'
} as const;
export type UserApproachChoiceEnum = typeof UserApproachChoiceEnum[keyof typeof UserApproachChoiceEnum];

/**
 * @export
 */
export const UserDateModeEnum = {
    ghost: 'ghost',
    live: 'live'
} as const;
export type UserDateModeEnum = typeof UserDateModeEnum[keyof typeof UserDateModeEnum];


/**
 * Check if a given object implements the User interface.
 */
export function instanceOfUser(value: object): value is User {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('isActive' in value) || value['isActive'] === undefined) return false;
    if (!('firstName' in value) || value['firstName'] === undefined) return false;
    if (!('wantsEmailUpdates' in value) || value['wantsEmailUpdates'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('passwordHash' in value) || value['passwordHash'] === undefined) return false;
    if (!('passwordSalt' in value) || value['passwordSalt'] === undefined) return false;
    if (!('birthDay' in value) || value['birthDay'] === undefined) return false;
    if (!('gender' in value) || value['gender'] === undefined) return false;
    if (!('genderDesire' in value) || value['genderDesire'] === undefined) return false;
    if (!('imageURIs' in value) || value['imageURIs'] === undefined) return false;
    if (!('verificationStatus' in value) || value['verificationStatus'] === undefined) return false;
    if (!('approachChoice' in value) || value['approachChoice'] === undefined) return false;
    if (!('blacklistedRegions' in value) || value['blacklistedRegions'] === undefined) return false;
    if (!('approachFromTime' in value) || value['approachFromTime'] === undefined) return false;
    if (!('approachToTime' in value) || value['approachToTime'] === undefined) return false;
    if (!('bio' in value) || value['bio'] === undefined) return false;
    if (!('dateMode' in value) || value['dateMode'] === undefined) return false;
    if (!('pushToken' in value) || value['pushToken'] === undefined) return false;
    if (!('receivedReports' in value) || value['receivedReports'] === undefined) return false;
    if (!('issuedReports' in value) || value['issuedReports'] === undefined) return false;
    return true;
}

export function UserFromJSON(json: any): User {
    return UserFromJSONTyped(json, false);
}

export function UserFromJSONTyped(json: any, ignoreDiscriminator: boolean): User {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'isActive': json['isActive'],
        'firstName': json['firstName'],
        'wantsEmailUpdates': json['wantsEmailUpdates'],
        'email': json['email'],
        'passwordHash': json['passwordHash'],
        'passwordSalt': json['passwordSalt'],
        'birthDay': (new Date(json['birthDay'])),
        'gender': json['gender'],
        'genderDesire': json['genderDesire'],
        'imageURIs': json['imageURIs'],
        'verificationStatus': json['verificationStatus'],
        'approachChoice': json['approachChoice'],
        'blacklistedRegions': ((json['blacklistedRegions'] as Array<any>).map(BlacklistedRegionFromJSON)),
        'approachFromTime': (new Date(json['approachFromTime'])),
        'approachToTime': (new Date(json['approachToTime'])),
        'bio': json['bio'],
        'dateMode': json['dateMode'],
        'pushToken': json['pushToken'],
        'receivedReports': ((json['receivedReports'] as Array<any>).map(UserReportFromJSON)),
        'issuedReports': ((json['issuedReports'] as Array<any>).map(UserReportFromJSON)),
    };
}

export function UserToJSON(value?: User | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'isActive': value['isActive'],
        'firstName': value['firstName'],
        'wantsEmailUpdates': value['wantsEmailUpdates'],
        'email': value['email'],
        'passwordHash': value['passwordHash'],
        'passwordSalt': value['passwordSalt'],
        'birthDay': ((value['birthDay']).toISOString()),
        'gender': value['gender'],
        'genderDesire': value['genderDesire'],
        'imageURIs': value['imageURIs'],
        'verificationStatus': value['verificationStatus'],
        'approachChoice': value['approachChoice'],
        'blacklistedRegions': ((value['blacklistedRegions'] as Array<any>).map(BlacklistedRegionToJSON)),
        'approachFromTime': ((value['approachFromTime']).toISOString()),
        'approachToTime': ((value['approachToTime']).toISOString()),
        'bio': value['bio'],
        'dateMode': value['dateMode'],
        'pushToken': value['pushToken'],
        'receivedReports': ((value['receivedReports'] as Array<any>).map(UserReportToJSON)),
        'issuedReports': ((value['issuedReports'] as Array<any>).map(UserReportToJSON)),
    };
}

