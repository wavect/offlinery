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
 * @interface RegistrationForVerificationResponseDTO
 */
export interface RegistrationForVerificationResponseDTO {
    /**
     *
     * @type {string}
     * @memberof RegistrationForVerificationResponseDTO
     */
    email: string;
    /**
     * The timeout when the user can resend a verification code in milliseconds.
     * @type {number}
     * @memberof RegistrationForVerificationResponseDTO
     */
    timeout: number;
    /**
     * Timestamp when the verification code was issued.
     * @type {Date}
     * @memberof RegistrationForVerificationResponseDTO
     */
    verificationCodeIssuedAt: Date;
    /**
     *
     * @type {boolean}
     * @memberof RegistrationForVerificationResponseDTO
     */
    alreadyVerifiedButNotRegistered: boolean;
}

/**
 * Check if a given object implements the RegistrationForVerificationResponseDTO interface.
 */
export function instanceOfRegistrationForVerificationResponseDTO(
    value: object,
): value is RegistrationForVerificationResponseDTO {
    if (!("email" in value) || value["email"] === undefined) return false;
    if (!("timeout" in value) || value["timeout"] === undefined) return false;
    if (
        !("verificationCodeIssuedAt" in value) ||
        value["verificationCodeIssuedAt"] === undefined
    )
        return false;
    if (
        !("alreadyVerifiedButNotRegistered" in value) ||
        value["alreadyVerifiedButNotRegistered"] === undefined
    )
        return false;
    return true;
}

export function RegistrationForVerificationResponseDTOFromJSON(
    json: any,
): RegistrationForVerificationResponseDTO {
    return RegistrationForVerificationResponseDTOFromJSONTyped(json, false);
}

export function RegistrationForVerificationResponseDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): RegistrationForVerificationResponseDTO {
    if (json == null) {
        return json;
    }
    return {
        email: json["email"],
        timeout: json["timeout"],
        verificationCodeIssuedAt: new Date(json["verificationCodeIssuedAt"]),
        alreadyVerifiedButNotRegistered:
            json["alreadyVerifiedButNotRegistered"],
    };
}

export function RegistrationForVerificationResponseDTOToJSON(
    value?: RegistrationForVerificationResponseDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        email: value["email"],
        timeout: value["timeout"],
        verificationCodeIssuedAt:
            value["verificationCodeIssuedAt"].toISOString(),
        alreadyVerifiedButNotRegistered:
            value["alreadyVerifiedButNotRegistered"],
    };
}
