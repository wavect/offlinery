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
 * @interface VerifyResetPasswordDTO
 */
export interface VerifyResetPasswordDTO {
    /**
     *
     * @type {string}
     * @memberof VerifyResetPasswordDTO
     */
    email: string;
    /**
     *
     * @type {string}
     * @memberof VerifyResetPasswordDTO
     */
    verificationCode: string;
    /**
     *
     * @type {string}
     * @memberof VerifyResetPasswordDTO
     */
    newClearPassword: string;
}

/**
 * Check if a given object implements the VerifyResetPasswordDTO interface.
 */
export function instanceOfVerifyResetPasswordDTO(
    value: object,
): value is VerifyResetPasswordDTO {
    if (!("email" in value) || value["email"] === undefined) return false;
    if (
        !("verificationCode" in value) ||
        value["verificationCode"] === undefined
    )
        return false;
    if (
        !("newClearPassword" in value) ||
        value["newClearPassword"] === undefined
    )
        return false;
    return true;
}

export function VerifyResetPasswordDTOFromJSON(
    json: any,
): VerifyResetPasswordDTO {
    return VerifyResetPasswordDTOFromJSONTyped(json, false);
}

export function VerifyResetPasswordDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): VerifyResetPasswordDTO {
    if (json == null) {
        return json;
    }
    return {
        email: json["email"],
        verificationCode: json["verificationCode"],
        newClearPassword: json["newClearPassword"],
    };
}

export function VerifyResetPasswordDTOToJSON(
    value?: VerifyResetPasswordDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        email: value["email"],
        verificationCode: value["verificationCode"],
        newClearPassword: value["newClearPassword"],
    };
}
