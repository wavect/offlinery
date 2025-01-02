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

import type { MessagePublicDTO } from "./MessagePublicDTO";
import {
    MessagePublicDTOFromJSON,
    MessagePublicDTOToJSON,
} from "./MessagePublicDTO";
import type { UserPublicDTO } from "./UserPublicDTO";
import { UserPublicDTOFromJSON, UserPublicDTOToJSON } from "./UserPublicDTO";

/**
 *
 * @export
 * @interface EncounterPublicDTO
 */
export interface EncounterPublicDTO {
    /**
     * The unique identifier of the encounter
     * @type {string}
     * @memberof EncounterPublicDTO
     */
    id: string;
    /**
     * The status of the encounter
     * @type {string}
     * @memberof EncounterPublicDTO
     */
    status: EncounterPublicDTOStatusEnum;
    /**
     * The date time they were nearby last time.
     * @type {string}
     * @memberof EncounterPublicDTO
     */
    lastDateTimePassedBy: string;
    /**
     * Last rough location passed by
     * @type {string}
     * @memberof EncounterPublicDTO
     */
    lastLocationPassedBy?: string | null;
    /**
     * Has this encounter been reported by any of the users
     * @type {boolean}
     * @memberof EncounterPublicDTO
     */
    reported: boolean;
    /**
     * Other Users that was nearby
     * @type {UserPublicDTO}
     * @memberof EncounterPublicDTO
     */
    otherUser: UserPublicDTO;
    /**
     * User messages
     * @type {Array<MessagePublicDTO>}
     * @memberof EncounterPublicDTO
     */
    messages: Array<MessagePublicDTO> | null;
    /**
     *
     * @type {boolean}
     * @memberof EncounterPublicDTO
     */
    isNearbyRightNow: boolean | null;
    /**
     *
     * @type {number}
     * @memberof EncounterPublicDTO
     */
    amountStreaks: number;
}

/**
 * @export
 */
export const EncounterPublicDTOStatusEnum = {
    not_met: "not_met",
    met_not_interested: "met_not_interested",
    met_interested: "met_interested",
} as const;
export type EncounterPublicDTOStatusEnum =
    (typeof EncounterPublicDTOStatusEnum)[keyof typeof EncounterPublicDTOStatusEnum];

/**
 * Check if a given object implements the EncounterPublicDTO interface.
 */
export function instanceOfEncounterPublicDTO(
    value: object,
): value is EncounterPublicDTO {
    if (!("id" in value) || value["id"] === undefined) return false;
    if (!("status" in value) || value["status"] === undefined) return false;
    if (
        !("lastDateTimePassedBy" in value) ||
        value["lastDateTimePassedBy"] === undefined
    )
        return false;
    if (!("reported" in value) || value["reported"] === undefined) return false;
    if (!("otherUser" in value) || value["otherUser"] === undefined)
        return false;
    if (!("messages" in value) || value["messages"] === undefined) return false;
    if (
        !("isNearbyRightNow" in value) ||
        value["isNearbyRightNow"] === undefined
    )
        return false;
    if (!("amountStreaks" in value) || value["amountStreaks"] === undefined)
        return false;
    return true;
}

export function EncounterPublicDTOFromJSON(json: any): EncounterPublicDTO {
    return EncounterPublicDTOFromJSONTyped(json, false);
}

export function EncounterPublicDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): EncounterPublicDTO {
    if (json == null) {
        return json;
    }
    return {
        id: json["id"],
        status: json["status"],
        lastDateTimePassedBy: json["lastDateTimePassedBy"],
        lastLocationPassedBy:
            json["lastLocationPassedBy"] == null
                ? undefined
                : json["lastLocationPassedBy"],
        reported: json["reported"],
        otherUser: UserPublicDTOFromJSON(json["otherUser"]),
        messages:
            json["messages"] == null
                ? null
                : (json["messages"] as Array<any>).map(
                      MessagePublicDTOFromJSON,
                  ),
        isNearbyRightNow: json["isNearbyRightNow"],
        amountStreaks: json["amountStreaks"],
    };
}

export function EncounterPublicDTOToJSON(
    value?: EncounterPublicDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        id: value["id"],
        status: value["status"],
        lastDateTimePassedBy: value["lastDateTimePassedBy"],
        lastLocationPassedBy: value["lastLocationPassedBy"],
        reported: value["reported"],
        otherUser: UserPublicDTOToJSON(value["otherUser"]),
        messages:
            value["messages"] == null
                ? null
                : (value["messages"] as Array<any>).map(MessagePublicDTOToJSON),
        isNearbyRightNow: value["isNearbyRightNow"],
        amountStreaks: value["amountStreaks"],
    };
}
