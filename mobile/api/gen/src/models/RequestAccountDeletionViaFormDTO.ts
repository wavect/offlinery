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
 * @interface RequestAccountDeletionViaFormDTO
 */
export interface RequestAccountDeletionViaFormDTO {
    /**
     *
     * @type {string}
     * @memberof RequestAccountDeletionViaFormDTO
     */
    email: string;
}

/**
 * Check if a given object implements the RequestAccountDeletionViaFormDTO interface.
 */
export function instanceOfRequestAccountDeletionViaFormDTO(
    value: object,
): value is RequestAccountDeletionViaFormDTO {
    if (!("email" in value) || value["email"] === undefined) return false;
    return true;
}

export function RequestAccountDeletionViaFormDTOFromJSON(
    json: any,
): RequestAccountDeletionViaFormDTO {
    return RequestAccountDeletionViaFormDTOFromJSONTyped(json, false);
}

export function RequestAccountDeletionViaFormDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): RequestAccountDeletionViaFormDTO {
    if (json == null) {
        return json;
    }
    return {
        email: json["email"],
    };
}

export function RequestAccountDeletionViaFormDTOToJSON(
    value?: RequestAccountDeletionViaFormDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        email: value["email"],
    };
}
