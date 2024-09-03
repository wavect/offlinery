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
 * @interface DateRangeDTO
 */
export interface DateRangeDTO {
    /**
     * Start date for filtering
     * @type {Date}
     * @memberof DateRangeDTO
     */
    startDate?: Date;
    /**
     * End date for filtering
     * @type {Date}
     * @memberof DateRangeDTO
     */
    endDate?: Date;
}

/**
 * Check if a given object implements the DateRangeDTO interface.
 */
export function instanceOfDateRangeDTO(value: object): value is DateRangeDTO {
    return true;
}

export function DateRangeDTOFromJSON(json: any): DateRangeDTO {
    return DateRangeDTOFromJSONTyped(json, false);
}

export function DateRangeDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): DateRangeDTO {
    if (json == null) {
        return json;
    }
    return {
        startDate:
            json["startDate"] == null ? undefined : new Date(json["startDate"]),
        endDate:
            json["endDate"] == null ? undefined : new Date(json["endDate"]),
    };
}

export function DateRangeDTOToJSON(value?: DateRangeDTO | null): any {
    if (value == null) {
        return value;
    }
    return {
        startDate:
            value["startDate"] == null
                ? undefined
                : value["startDate"].toISOString(),
        endDate:
            value["endDate"] == null
                ? undefined
                : value["endDate"].toISOString(),
    };
}
