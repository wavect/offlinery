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
 * @interface RegistrationForVerificationDto
 */
export interface RegistrationForVerificationDto {
  /**
   *
   * @type {string}
   * @memberof RegistrationForVerificationDto
   */
  email: string;
}

/**
 * Check if a given object implements the RegistrationForVerificationDto interface.
 */
export function instanceOfRegistrationForVerificationDto(
  value: object,
): value is RegistrationForVerificationDto {
  if (!("email" in value) || value["email"] === undefined) return false;
  return true;
}

export function RegistrationForVerificationDtoFromJSON(
  json: any,
): RegistrationForVerificationDto {
  return RegistrationForVerificationDtoFromJSONTyped(json, false);
}

export function RegistrationForVerificationDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): RegistrationForVerificationDto {
  if (json == null) {
    return json;
  }
  return {
    email: json["email"],
  };
}

export function RegistrationForVerificationDtoToJSON(
  value?: RegistrationForVerificationDto | null,
): any {
  if (value == null) {
    return value;
  }
  return {
    email: value["email"],
  };
}
