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

import type { BlacklistedRegionDTOLocation } from "./BlacklistedRegionDTOLocation";
import {
    BlacklistedRegionDTOLocationFromJSON,
    BlacklistedRegionDTOLocationToJSON,
} from "./BlacklistedRegionDTOLocation";

/**
 *
 * @export
 * @interface BlacklistedRegionDTO
 */
export interface BlacklistedRegionDTO {
    /**
     *
     * @type {BlacklistedRegionDTOLocation}
     * @memberof BlacklistedRegionDTO
     */
    location: BlacklistedRegionDTOLocation;
    /**
     * Radius of the blacklisted region in meters
     * @type {number}
     * @memberof BlacklistedRegionDTO
     */
    radius: number;
}

/**
 * Check if a given object implements the BlacklistedRegionDTO interface.
 */
export function instanceOfBlacklistedRegionDTO(
    value: object,
): value is BlacklistedRegionDTO {
    if (!("location" in value) || value["location"] === undefined) return false;
    if (!("radius" in value) || value["radius"] === undefined) return false;
    return true;
}

export function BlacklistedRegionDTOFromJSON(json: any): BlacklistedRegionDTO {
    return BlacklistedRegionDTOFromJSONTyped(json, false);
}

export function BlacklistedRegionDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): BlacklistedRegionDTO {
    if (json == null) {
        return json;
    }
    return {
        location: BlacklistedRegionDTOLocationFromJSON(json["location"]),
        radius: json["radius"],
    };
}

export function BlacklistedRegionDTOToJSON(
    value?: BlacklistedRegionDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        location: BlacklistedRegionDTOLocationToJSON(value["location"]),
        radius: value["radius"],
    };
}
