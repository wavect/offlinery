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
 * @interface NotificationSafetyCallMissedDTO
 */
export interface NotificationSafetyCallMissedDTO {
    /**
     *
     * @type {string}
     * @memberof NotificationSafetyCallMissedDTO
     */
    type: NotificationSafetyCallMissedDTOTypeEnum;
    /**
     *
     * @type {string}
     * @memberof NotificationSafetyCallMissedDTO
     */
    screen: NotificationSafetyCallMissedDTOScreenEnum;
}

/**
 * @export
 */
export const NotificationSafetyCallMissedDTOTypeEnum = {
    new_match: "new_match",
    new_event: "new_event",
    account_approved: "account_approved",
    ghostmode_reminder: "ghostmode_reminder",
    safetycall_reminder: "safetycall_reminder",
    account_denied: "account_denied",
    new_message: "new_message",
    safety_call_missed: "safety_call_missed",
    did_you_meet: "did_you_meet",
} as const;
export type NotificationSafetyCallMissedDTOTypeEnum =
    (typeof NotificationSafetyCallMissedDTOTypeEnum)[keyof typeof NotificationSafetyCallMissedDTOTypeEnum];

/**
 * @export
 */
export const NotificationSafetyCallMissedDTOScreenEnum = {
    Main_NavigateToApproach: "Main_NavigateToApproach",
    Main_FindPeople: "Main_FindPeople",
    Main_FindPeople2: "Main_FindPeople",
    Main_FindPeople3: "Main_FindPeople",
    Main_FindPeople4: "Main_FindPeople",
    Main_FindPeople5: "Main_FindPeople",
    Main_Encounters_onTab: "Main_Encounters_onTab",
    Main_Encounters_onTab2: "Main_Encounters_onTab",
    Welcome: "Welcome",
} as const;
export type NotificationSafetyCallMissedDTOScreenEnum =
    (typeof NotificationSafetyCallMissedDTOScreenEnum)[keyof typeof NotificationSafetyCallMissedDTOScreenEnum];

/**
 * Check if a given object implements the NotificationSafetyCallMissedDTO interface.
 */
export function instanceOfNotificationSafetyCallMissedDTO(
    value: object,
): value is NotificationSafetyCallMissedDTO {
    if (!("type" in value) || value["type"] === undefined) return false;
    if (!("screen" in value) || value["screen"] === undefined) return false;
    return true;
}

export function NotificationSafetyCallMissedDTOFromJSON(
    json: any,
): NotificationSafetyCallMissedDTO {
    return NotificationSafetyCallMissedDTOFromJSONTyped(json, false);
}

export function NotificationSafetyCallMissedDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): NotificationSafetyCallMissedDTO {
    if (json == null) {
        return json;
    }
    return {
        type: json["type"],
        screen: json["screen"],
    };
}

export function NotificationSafetyCallMissedDTOToJSON(
    value?: NotificationSafetyCallMissedDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        type: value["type"],
        screen: value["screen"],
    };
}
