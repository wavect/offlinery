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
 * @interface NotificationNewMessageDTO
 */
export interface NotificationNewMessageDTO {
    /**
     *
     * @type {string}
     * @memberof NotificationNewMessageDTO
     */
    type: NotificationNewMessageDTOTypeEnum;
    /**
     *
     * @type {string}
     * @memberof NotificationNewMessageDTO
     */
    screen: NotificationNewMessageDTOScreenEnum;
}

/**
 * @export
 */
export const NotificationNewMessageDTOTypeEnum = {
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
export type NotificationNewMessageDTOTypeEnum =
    (typeof NotificationNewMessageDTOTypeEnum)[keyof typeof NotificationNewMessageDTOTypeEnum];

/**
 * @export
 */
export const NotificationNewMessageDTOScreenEnum = {
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
export type NotificationNewMessageDTOScreenEnum =
    (typeof NotificationNewMessageDTOScreenEnum)[keyof typeof NotificationNewMessageDTOScreenEnum];

/**
 * Check if a given object implements the NotificationNewMessageDTO interface.
 */
export function instanceOfNotificationNewMessageDTO(
    value: object,
): value is NotificationNewMessageDTO {
    if (!("type" in value) || value["type"] === undefined) return false;
    if (!("screen" in value) || value["screen"] === undefined) return false;
    return true;
}

export function NotificationNewMessageDTOFromJSON(
    json: any,
): NotificationNewMessageDTO {
    return NotificationNewMessageDTOFromJSONTyped(json, false);
}

export function NotificationNewMessageDTOFromJSONTyped(
    json: any,
    ignoreDiscriminator: boolean,
): NotificationNewMessageDTO {
    if (json == null) {
        return json;
    }
    return {
        type: json["type"],
        screen: json["screen"],
    };
}

export function NotificationNewMessageDTOToJSON(
    value?: NotificationNewMessageDTO | null,
): any {
    if (value == null) {
        return value;
    }
    return {
        type: value["type"],
        screen: value["screen"],
    };
}
