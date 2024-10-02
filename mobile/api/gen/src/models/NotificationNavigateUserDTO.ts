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

import type { UserPublicDTO } from "./UserPublicDTO";
import { UserPublicDTOFromJSON, UserPublicDTOToJSON } from "./UserPublicDTO";

/**
 *
 * @export
 * @interface NotificationNavigateUserDTO
 */
export interface NotificationNavigateUserDTO {
    /**
     *
     * @type {string}
     * @memberof NotificationNavigateUserDTO
     */
    screen: NotificationNavigateUserDTOScreenEnum;
    /**
     *
     * @type {UserPublicDTO}
     * @memberof NotificationNavigateUserDTO
     */
    navigateToPerson: UserPublicDTO;
    /**
     *
     * @type {string}
     * @memberof NotificationNavigateUserDTO
     */
    encounterId: string;
}

/**
 * @export
 */
export const NotificationNavigateUserDTOScreenEnum = {
    Main_NavigateToApproach: "Main_NavigateToApproach",
} as const;
export type NotificationNavigateUserDTOScreenEnum =
    (typeof NotificationNavigateUserDTOScreenEnum)[keyof typeof NotificationNavigateUserDTOScreenEnum];

/**
 * Check if a given object implements the NotificationNavigateUserDTO interface.
 */
export function instanceOfNotificationNavigateUserDTO(
    value: object,
): value is NotificationNavigateUserDTO {
    if (!("screen" in value) || value["screen"] === undefined) return false;
    if (
        !("navigateToPerson" in value) ||
        value["navigateToPerson"] === undefined
    )
        return false;
    if (!("encounterId" in value) || value["encounterId"] === undefined)
        return false;
    return true;
}

export function NotificationNavigateUserDTOFromJSON(
    json: any,
): NotificationNavigateUserDTO {
    return NotificationNavigateUserDTOFromJSONTyped(json, false);
}

export function NotificationNavigateUserDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): NotificationNavigateUserDTO {
    if (json == null) {
        return json;
    }
    return {
        screen: json["screen"],
        navigateToPerson: UserPublicDTOFromJSON(json["navigateToPerson"]),
        encounterId: json["encounterId"],
    };
}

export function NotificationNavigateUserDTOToJSON(
    value?: NotificationNavigateUserDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        screen: value["screen"],
        navigateToPerson: UserPublicDTOToJSON(value["navigateToPerson"]),
        encounterId: value["encounterId"],
    };
}
