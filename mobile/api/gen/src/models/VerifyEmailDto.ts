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

import { mapValues } from "../runtime";
/**
 *
 * @export
 * @interface VerifyEmailDto
 */
export interface VerifyEmailDto {
  /**
   *
   * @type {string}
   * @memberof VerifyEmailDto
   */
  email: string;
  /**
   *
   * @type {string}
   * @memberof VerifyEmailDto
   */
  verificationCode: string;
}

/**
 * Check if a given object implements the VerifyEmailDto interface.
 */
export function instanceOfVerifyEmailDto(
  value: object,
): value is VerifyEmailDto {
  if (!("email" in value) || value["email"] === undefined) return false;
  if (!("verificationCode" in value) || value["verificationCode"] === undefined)
    return false;
  return true;
}

export function VerifyEmailDtoFromJSON(json: any): VerifyEmailDto {
  return VerifyEmailDtoFromJSONTyped(json, false);
}

export function VerifyEmailDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): VerifyEmailDto {
  if (json == null) {
    return json;
  }
  return {
    email: json["email"],
    verificationCode: json["verificationCode"],
  };
}

export function VerifyEmailDtoToJSON(value?: VerifyEmailDto | null): any {
  if (value == null) {
    return value;
  }
  return {
    email: value["email"],
    verificationCode: value["verificationCode"],
  };
}
