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

import type { MultiLingStringDTO } from "./MultiLingStringDTO";
import {
    MultiLingStringDTOFromJSON,
    MultiLingStringDTOToJSON,
} from "./MultiLingStringDTO";

/**
 *
 * @export
 * @interface NewEventDTO
 */
export interface NewEventDTO {
    /**
     *
     * @type {Date}
     * @memberof NewEventDTO
     */
    eventStartDateTime: Date;
    /**
     *
     * @type {Date}
     * @memberof NewEventDTO
     */
    eventEndDateTime: Date;
    /**
     *
     * @type {MultiLingStringDTO}
     * @memberof NewEventDTO
     */
    eventTitle: MultiLingStringDTO;
    /**
     *
     * @type {MultiLingStringDTO}
     * @memberof NewEventDTO
     */
    eventDescription: MultiLingStringDTO;
}

/**
 * Check if a given object implements the NewEventDTO interface.
 */
export function instanceOfNewEventDTO(value: object): value is NewEventDTO {
    if (
        !("eventStartDateTime" in value) ||
        value["eventStartDateTime"] === undefined
    )
        return false;
    if (
        !("eventEndDateTime" in value) ||
        value["eventEndDateTime"] === undefined
    )
        return false;
    if (!("eventTitle" in value) || value["eventTitle"] === undefined)
        return false;
    if (
        !("eventDescription" in value) ||
        value["eventDescription"] === undefined
    )
        return false;
    return true;
}

export function NewEventDTOFromJSON(json: any): NewEventDTO {
    return NewEventDTOFromJSONTyped(json, false);
}

export function NewEventDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): NewEventDTO {
    if (json == null) {
        return json;
    }
    return {
        eventStartDateTime: new Date(json["eventStartDateTime"]),
        eventEndDateTime: new Date(json["eventEndDateTime"]),
        eventTitle: MultiLingStringDTOFromJSON(json["eventTitle"]),
        eventDescription: MultiLingStringDTOFromJSON(json["eventDescription"]),
    };
}

export function NewEventDTOToJSON(value?: NewEventDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        eventStartDateTime: value["eventStartDateTime"].toISOString(),
        eventEndDateTime: value["eventEndDateTime"].toISOString(),
        eventTitle: MultiLingStringDTOToJSON(value["eventTitle"]),
        eventDescription: MultiLingStringDTOToJSON(value["eventDescription"]),
    };
}
