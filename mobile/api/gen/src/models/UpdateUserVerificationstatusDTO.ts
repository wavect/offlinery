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
 * @interface UpdateUserVerificationstatusDTO
 */
export interface UpdateUserVerificationstatusDTO {
    /**
     *
     * @type {string}
     * @memberof UpdateUserVerificationstatusDTO
     */
    email: string;
    /**
     * New verification status
     * @type {string}
     * @memberof UpdateUserVerificationstatusDTO
     */
    newVerificationStatus: UpdateUserVerificationstatusDTONewVerificationStatusEnum;
}

/**
 * @export
 */
export const UpdateUserVerificationstatusDTONewVerificationStatusEnum = {
    verified: "verified",
    pending: "pending",
} as const;
export type UpdateUserVerificationstatusDTONewVerificationStatusEnum =
    (typeof UpdateUserVerificationstatusDTONewVerificationStatusEnum)[keyof typeof UpdateUserVerificationstatusDTONewVerificationStatusEnum];

/**
 * Check if a given object implements the UpdateUserVerificationstatusDTO interface.
 */
export function instanceOfUpdateUserVerificationstatusDTO(
    value: object,
): value is UpdateUserVerificationstatusDTO {
    if (!("email" in value) || value["email"] === undefined) return false;
    if (
        !("newVerificationStatus" in value) ||
        value["newVerificationStatus"] === undefined
    )
        return false;
    return true;
}

export function UpdateUserVerificationstatusDTOFromJSON(
    json: any,
): UpdateUserVerificationstatusDTO {
    return UpdateUserVerificationstatusDTOFromJSONTyped(json, false);
}

export function UpdateUserVerificationstatusDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): UpdateUserVerificationstatusDTO {
    if (json == null) {
        return json;
    }
    return {
        email: json["email"],
        newVerificationStatus: json["newVerificationStatus"],
    };
}

export function UpdateUserVerificationstatusDTOToJSON(
    value?: UpdateUserVerificationstatusDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        email: value["email"],
        newVerificationStatus: value["newVerificationStatus"],
    };
}
