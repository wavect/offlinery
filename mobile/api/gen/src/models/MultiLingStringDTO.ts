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
 * @interface MultiLingStringDTO
 */
export interface MultiLingStringDTO {
    /**
     * Multi-lingual string object with translations for different languages
     * @type {object}
     * @memberof MultiLingStringDTO
     */
    translations: object;
}

/**
 * Check if a given object implements the MultiLingStringDTO interface.
 */
export function instanceOfMultiLingStringDTO(
    value: object,
): value is MultiLingStringDTO {
    if (!("translations" in value) || value["translations"] === undefined)
        return false;
    return true;
}

export function MultiLingStringDTOFromJSON(json: any): MultiLingStringDTO {
    return MultiLingStringDTOFromJSONTyped(json, false);
}

export function MultiLingStringDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): MultiLingStringDTO {
    if (json == null) {
        return json;
    }
    return {
        translations: json["translations"],
    };
}

export function MultiLingStringDTOToJSON(
    value?: MultiLingStringDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        translations: value["translations"],
    };
}
