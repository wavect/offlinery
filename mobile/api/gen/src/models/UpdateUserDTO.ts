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
import type { BlacklistedRegionDTO } from './BlacklistedRegionDTO';
import {
    BlacklistedRegionDTOFromJSON,
    BlacklistedRegionDTOFromJSONTyped,
    BlacklistedRegionDTOToJSON,
} from './BlacklistedRegionDTO';

/**
 * 
 * @export
 * @interface UpdateUserDTO
 */
export interface UpdateUserDTO {
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    email?: string;
    /**
     * 
     * @type {boolean}
     * @memberof UpdateUserDTO
     */
    wantsEmailUpdates?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof UpdateUserDTO
     */
    birthDay?: Date;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    gender?: UpdateUserDTOGenderEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    genderDesire?: UpdateUserDTOGenderDesireEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    verificationStatus?: UpdateUserDTOVerificationStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    approachChoice?: UpdateUserDTOApproachChoiceEnum;
    /**
     * Array of blacklisted regions
     * @type {Array<BlacklistedRegionDTO>}
     * @memberof UpdateUserDTO
     */
    blacklistedRegions?: Array<BlacklistedRegionDTO>;
    /**
     * 
     * @type {Date}
     * @memberof UpdateUserDTO
     */
    approachFromTime?: Date;
    /**
     * 
     * @type {Date}
     * @memberof UpdateUserDTO
     */
    approachToTime?: Date;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    bio?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    dateMode?: UpdateUserDTODateModeEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateUserDTO
     */
    clearPassword?: string;
}


/**
 * @export
 */
export const UpdateUserDTOGenderEnum = {
    Woman: 'woman',
    Man: 'man'
} as const;
export type UpdateUserDTOGenderEnum = typeof UpdateUserDTOGenderEnum[keyof typeof UpdateUserDTOGenderEnum];

/**
 * @export
 */
export const UpdateUserDTOGenderDesireEnum = {
    Woman: 'woman',
    Man: 'man'
} as const;
export type UpdateUserDTOGenderDesireEnum = typeof UpdateUserDTOGenderDesireEnum[keyof typeof UpdateUserDTOGenderDesireEnum];

/**
 * @export
 */
export const UpdateUserDTOVerificationStatusEnum = {
    Verified: 'verified',
    Pending: 'pending',
    NotNeeded: 'not_needed'
} as const;
export type UpdateUserDTOVerificationStatusEnum = typeof UpdateUserDTOVerificationStatusEnum[keyof typeof UpdateUserDTOVerificationStatusEnum];

/**
 * @export
 */
export const UpdateUserDTOApproachChoiceEnum = {
    Approach: 'approach',
    BeApproached: 'be_approached',
    Both: 'both'
} as const;
export type UpdateUserDTOApproachChoiceEnum = typeof UpdateUserDTOApproachChoiceEnum[keyof typeof UpdateUserDTOApproachChoiceEnum];

/**
 * @export
 */
export const UpdateUserDTODateModeEnum = {
    Ghost: 'ghost',
    Live: 'live'
} as const;
export type UpdateUserDTODateModeEnum = typeof UpdateUserDTODateModeEnum[keyof typeof UpdateUserDTODateModeEnum];


/**
 * Check if a given object implements the UpdateUserDTO interface.
 */
export function instanceOfUpdateUserDTO(value: object): value is UpdateUserDTO {
    return true;
}

export function UpdateUserDTOFromJSON(json: any): UpdateUserDTO {
    return UpdateUserDTOFromJSONTyped(json, false);
}

export function UpdateUserDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateUserDTO {
    if (json == null) {
        return json;
    }
    return {
        
        'firstName': json['firstName'] == null ? undefined : json['firstName'],
        'email': json['email'] == null ? undefined : json['email'],
        'wantsEmailUpdates': json['wantsEmailUpdates'] == null ? undefined : json['wantsEmailUpdates'],
        'birthDay': json['birthDay'] == null ? undefined : json['birthDay'],
        'gender': json['gender'] == null ? undefined : json['gender'],
        'genderDesire': json['genderDesire'] == null ? undefined : json['genderDesire'],
        'verificationStatus': json['verificationStatus'] == null ? undefined : json['verificationStatus'],
        'approachChoice': json['approachChoice'] == null ? undefined : json['approachChoice'],
        'blacklistedRegions': json['blacklistedRegions'] == null ? undefined : ((json['blacklistedRegions'] as Array<any>).map(BlacklistedRegionDTOFromJSON)),
        'approachFromTime': json['approachFromTime'] == null ? undefined : (new Date(json['approachFromTime'])),
        'approachToTime': json['approachToTime'] == null ? undefined : (new Date(json['approachToTime'])),
        'bio': json['bio'] == null ? undefined : json['bio'],
        'dateMode': json['dateMode'] == null ? undefined : json['dateMode'],
        'clearPassword': json['clearPassword'] == null ? undefined : json['clearPassword'],
    };
}

export function UpdateUserDTOToJSON(value?: UpdateUserDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'firstName': value['firstName'],
        'email': value['email'],
        'wantsEmailUpdates': value['wantsEmailUpdates'],
        'birthDay': value['birthDay'],
        'gender': value['gender'],
        'genderDesire': value['genderDesire'],
        'verificationStatus': value['verificationStatus'],
        'approachChoice': value['approachChoice'],
        'blacklistedRegions': value['blacklistedRegions'] == null ? undefined : ((value['blacklistedRegions'] as Array<any>).map(BlacklistedRegionDTOToJSON)),
        'approachFromTime': value['approachFromTime'] == null ? undefined : ((value['approachFromTime']).toISOString()),
        'approachToTime': value['approachToTime'] == null ? undefined : ((value['approachToTime']).toISOString()),
        'bio': value['bio'],
        'dateMode': value['dateMode'],
        'clearPassword': value['clearPassword'],
    };
}

