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

/**
 *
 * @export
 * @interface UserCountDTO
 */
export interface UserCountDTO {
    /**
     * Amount of users
     * @type {number}
     * @memberof UserCountDTO
     */
    userCount: number;
}

/**
 * Check if a given object implements the UserCountDTO interface.
 */
export function instanceOfUserCountDTO(value: object): value is UserCountDTO {
    if (!("userCount" in value) || value["userCount"] === undefined)
        return false;
    return true;
}

export function UserCountDTOFromJSON(json: any): UserCountDTO {
    return UserCountDTOFromJSONTyped(json, false);
}

export function UserCountDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): UserCountDTO {
    if (json == null) {
        return json;
    }
    return {
        userCount: json["userCount"],
    };
}

export function UserCountDTOToJSON(value?: UserCountDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        userCount: value["userCount"],
    };
}
