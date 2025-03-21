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
 * @interface LocationDTO
 */
export interface LocationDTO {
    /**
     * Latitude of the user's location
     * @type {number}
     * @memberof LocationDTO
     */
    latitude: number;
    /**
     * Longitude of the user's location
     * @type {number}
     * @memberof LocationDTO
     */
    longitude: number;
}

/**
 * Check if a given object implements the LocationDTO interface.
 */
export function instanceOfLocationDTO(value: object): value is LocationDTO {
    if (!("latitude" in value) || value["latitude"] === undefined) return false;
    if (!("longitude" in value) || value["longitude"] === undefined)
        return false;
    return true;
}

export function LocationDTOFromJSON(json: any): LocationDTO {
    return LocationDTOFromJSONTyped(json, false);
}

export function LocationDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): LocationDTO {
    if (json == null) {
        return json;
    }
    return {
        latitude: json["latitude"],
        longitude: json["longitude"],
    };
}

export function LocationDTOToJSON(value?: LocationDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        latitude: value["latitude"],
        longitude: value["longitude"],
    };
}
