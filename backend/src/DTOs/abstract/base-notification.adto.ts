export enum ENotificationType {
    NEW_MATCH = "new_match",
    NEW_EVENT = "new_event",
}

export abstract class BaseNotificationADTO {
    readonly type: ENotificationType;
}
