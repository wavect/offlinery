/* tslint:disable */
/* eslint-disable */
/**
 * Offlinery
 * API of Offlinery
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface StorePushTokenDto
 */
export interface StorePushTokenDto {
    /**
     * The unique identifier of the user
     * @type {number}
     * @memberof StorePushTokenDto
     */
    userId: number;
    /**
     * The Expo push token for the user's device
     * @type {string}
     * @memberof StorePushTokenDto
     */
    pushToken: string;
}

/**
 * Check if a given object implements the StorePushTokenDto interface.
 */
export function instanceOfStorePushTokenDto(value: object): value is StorePushTokenDto {
    if (!('userId' in value) || value['userId'] === undefined) return false;
    if (!('pushToken' in value) || value['pushToken'] === undefined) return false;
    return true;
}

export function StorePushTokenDtoFromJSON(json: any): StorePushTokenDto {
    return StorePushTokenDtoFromJSONTyped(json, false);
}

export function StorePushTokenDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): StorePushTokenDto {
    if (json == null) {
        return json;
    }
    return {
        
        'userId': json['userId'],
        'pushToken': json['pushToken'],
    };
}

export function StorePushTokenDtoToJSON(value?: StorePushTokenDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'userId': value['userId'],
        'pushToken': value['pushToken'],
    };
}

