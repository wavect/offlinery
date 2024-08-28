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
 * @interface StorePushTokenDTO
 */
export interface StorePushTokenDTO {
  /**
   * The unique identifier of the user
   * @type {string}
   * @memberof StorePushTokenDTO
   */
  userId: string;
  /**
   * The Expo push token for the user's device
   * @type {string}
   * @memberof StorePushTokenDTO
   */
  pushToken: string;
}

/**
 * Check if a given object implements the StorePushTokenDTO interface.
 */
export function instanceOfStorePushTokenDTO(
  value: object,
): value is StorePushTokenDTO {
  if (!("userId" in value) || value["userId"] === undefined) return false;
  if (!("pushToken" in value) || value["pushToken"] === undefined) return false;
  return true;
}

export function StorePushTokenDTOFromJSON(json: any): StorePushTokenDTO {
  return StorePushTokenDTOFromJSONTyped(json, false);
}

export function StorePushTokenDTOFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): StorePushTokenDTO {
  if (json == null) {
    return json;
  }
  return {
    userId: json["userId"],
    pushToken: json["pushToken"],
  };
}

export function StorePushTokenDTOToJSON(value?: StorePushTokenDTO | null): any {
  if (value == null) {
    return value;
  }
  return {
    userId: value["userId"],
    pushToken: value["pushToken"],
  };
}
