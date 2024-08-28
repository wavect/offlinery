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
 * @interface CreateUserReportDto
 */
export interface CreateUserReportDto {
  /**
   * The description of the incident
   * @type {string}
   * @memberof CreateUserReportDto
   */
  incidentDescription: string;
  /**
   * Whether to keep the reporter updated on the report status
   * @type {boolean}
   * @memberof CreateUserReportDto
   */
  keepReporterInTheLoop: boolean;
  /**
   * The type of incident
   * @type {string}
   * @memberof CreateUserReportDto
   */
  incidentType: CreateUserReportDtoIncidentTypeEnum;
  /**
   * The ID of the user being reported
   * @type {string}
   * @memberof CreateUserReportDto
   */
  reportedUserId: string;
  /**
   * The ID of the user making the report
   * @type {string}
   * @memberof CreateUserReportDto
   */
  reportingUserId: string;
}

/**
 * @export
 */
export const CreateUserReportDtoIncidentTypeEnum = {
  Disrespectful: "Disrespectful",
  Sexual_harassment: "Sexual harassment",
  Violent_behavior: "Violent behavior",
  Other: "Other",
} as const;
export type CreateUserReportDtoIncidentTypeEnum =
  (typeof CreateUserReportDtoIncidentTypeEnum)[keyof typeof CreateUserReportDtoIncidentTypeEnum];

/**
 * Check if a given object implements the CreateUserReportDto interface.
 */
export function instanceOfCreateUserReportDto(
  value: object,
): value is CreateUserReportDto {
  if (
    !("incidentDescription" in value) ||
    value["incidentDescription"] === undefined
  )
    return false;
  if (
    !("keepReporterInTheLoop" in value) ||
    value["keepReporterInTheLoop"] === undefined
  )
    return false;
  if (!("incidentType" in value) || value["incidentType"] === undefined)
    return false;
  if (!("reportedUserId" in value) || value["reportedUserId"] === undefined)
    return false;
  if (!("reportingUserId" in value) || value["reportingUserId"] === undefined)
    return false;
  return true;
}

export function CreateUserReportDtoFromJSON(json: any): CreateUserReportDto {
  return CreateUserReportDtoFromJSONTyped(json, false);
}

export function CreateUserReportDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CreateUserReportDto {
  if (json == null) {
    return json;
  }
  return {
    incidentDescription: json["incidentDescription"],
    keepReporterInTheLoop: json["keepReporterInTheLoop"],
    incidentType: json["incidentType"],
    reportedUserId: json["reportedUserId"],
    reportingUserId: json["reportingUserId"],
  };
}

export function CreateUserReportDtoToJSON(
  value?: CreateUserReportDto | null,
): any {
  if (value == null) {
    return value;
  }
  return {
    incidentDescription: value["incidentDescription"],
    keepReporterInTheLoop: value["keepReporterInTheLoop"],
    incidentType: value["incidentType"],
    reportedUserId: value["reportedUserId"],
    reportingUserId: value["reportingUserId"],
  };
}
