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
     * @type {string}
     * @memberof CreateUserDTO
     */
    genderDesire: CreateUserDTOGenderDesireEnum;
    /**
     * 
     * @type {string}
     * @memberof CreateUserDTO
     */
    verificationStatus: CreateUserDTOVerificationStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof CreateUserDTO
     */
    approachChoice: CreateUserDTOApproachChoiceEnum;
    /**
     * Array of blacklisted regions
     * @type {Array<BlacklistedRegionDTO>}
     * @memberof CreateUserDTO
     */
    blacklistedRegions: Array<BlacklistedRegionDTO>;
    /**
     * 
     * @type {Date}
     * @memberof CreateUserDTO
     */
    approachFromTime: Date;
    /**
     * 
     * @type {Date}
     * @memberof CreateUserDTO
     */
    approachToTime: Date;
    /**
     * 
     * @type {string}
     * @memberof CreateUserDTO
     */
    bio: string;
    /**
     * 
     * @type {string}
     * @memberof CreateUserDTO
     */
    dateMode: CreateUserDTODateModeEnum;
}


/**
 * @export
 */
export const CreateUserDTOGenderEnum = {
    woman: 'woman',
    man: 'man'
} as const;
export type CreateUserDTOGenderEnum = typeof CreateUserDTOGenderEnum[keyof typeof CreateUserDTOGenderEnum];

/**
 * @export
 */
export const CreateUserDTOGenderDesireEnum = {
    woman: 'woman',
    man: 'man'
} as const;
export type CreateUserDTOGenderDesireEnum = typeof CreateUserDTOGenderDesireEnum[keyof typeof CreateUserDTOGenderDesireEnum];

/**
 * @export
 */
export const CreateUserDTOVerificationStatusEnum = {
    verified: 'verified',
    pending: 'pending',
    not_needed: 'not_needed'
} as const;
export type CreateUserDTOVerificationStatusEnum = typeof CreateUserDTOVerificationStatusEnum[keyof typeof CreateUserDTOVerificationStatusEnum];

/**
 * @export
 */
export const CreateUserDTOApproachChoiceEnum = {
    approach: 'approach',
    be_approached: 'be_approached',
    both: 'both'
} as const;
export type CreateUserDTOApproachChoiceEnum = typeof CreateUserDTOApproachChoiceEnum[keyof typeof CreateUserDTOApproachChoiceEnum];

/**
 * @export
 */
export const CreateUserDTODateModeEnum = {
    ghost: 'ghost',
    live: 'live'
} as const;
export type CreateUserDTODateModeEnum = typeof CreateUserDTODateModeEnum[keyof typeof CreateUserDTODateModeEnum];


/**
 * Check if a given object implements the CreateUserDTO interface.
 */
export function instanceOfCreateUserDTO(value: object): value is CreateUserDTO {
    if (!('firstName' in value) || value['firstName'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('clearPassword' in value) || value['clearPassword'] === undefined) return false;
    if (!('wantsEmailUpdates' in value) || value['wantsEmailUpdates'] === undefined) return false;
    if (!('birthDay' in value) || value['birthDay'] === undefined) return false;
    if (!('gender' in value) || value['gender'] === undefined) return false;
    if (!('genderDesire' in value) || value['genderDesire'] === undefined) return false;
    if (!('verificationStatus' in value) || value['verificationStatus'] === undefined) return false;
    if (!('approachChoice' in value) || value['approachChoice'] === undefined) return false;
    if (!('blacklistedRegions' in value) || value['blacklistedRegions'] === undefined) return false;
    if (!('approachFromTime' in value) || value['approachFromTime'] === undefined) return false;
    if (!('approachToTime' in value) || value['approachToTime'] === undefined) return false;
    if (!('bio' in value) || value['bio'] === undefined) return false;
    if (!('dateMode' in value) || value['dateMode'] === undefined) return false;
    return true;
}

export function CreateUserDTOFromJSON(json: any): CreateUserDTO {
    return CreateUserDTOFromJSONTyped(json, false);
}

export function CreateUserDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateUserDTO {
    if (json == null) {
        return json;
    }
    return {
        
        'firstName': json['firstName'],
        'email': json['email'],
        'clearPassword': json['clearPassword'],
        'wantsEmailUpdates': json['wantsEmailUpdates'],
        'birthDay': (new Date(json['birthDay'])),
        'gender': json['gender'],
        'genderDesire': json['genderDesire'],
        'verificationStatus': json['verificationStatus'],
        'approachChoice': json['approachChoice'],
        'blacklistedRegions': ((json['blacklistedRegions'] as Array<any>).map(BlacklistedRegionDTOFromJSON)),
        'approachFromTime': (new Date(json['approachFromTime'])),
        'approachToTime': (new Date(json['approachToTime'])),
        'bio': json['bio'],
        'dateMode': json['dateMode'],
    };
}

export function CreateUserDTOToJSON(value?: CreateUserDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'firstName': value['firstName'],
        'email': value['email'],
        'clearPassword': value['clearPassword'],
        'wantsEmailUpdates': value['wantsEmailUpdates'],
        'birthDay': ((value['birthDay']).toISOString().substring(0,10)),
        'gender': value['gender'],
        'genderDesire': value['genderDesire'],
        'verificationStatus': value['verificationStatus'],
        'approachChoice': value['approachChoice'],
        'blacklistedRegions': ((value['blacklistedRegions'] as Array<any>).map(BlacklistedRegionDTOToJSON)),
        'approachFromTime': ((value['approachFromTime']).toISOString()),
        'approachToTime': ((value['approachToTime']).toISOString()),
        'bio': value['bio'],
        'dateMode': value['dateMode'],
    };
}

