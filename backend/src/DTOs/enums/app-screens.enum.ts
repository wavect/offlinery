/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

/** @dev To ensure screens are properly typed on frontend. The Enum Values should be the same as in the routes on mobile! */
export enum EAppScreens {
    NAVIGATE_TO_APPROACH = "Main_NavigateToApproach",
    NEW_EVENT = "Main_FindPeople", // TODO: This might be a dedicated screen in future
    ACCOUNT_VERIFIED = "Main_FindPeople",
    GHOSTMODE_REMINDER = "Main_FindPeople",
    SAFETYCALL_REMINDER = "Main_FindPeople",
    ACCOUNT_DENIED = "Main_FindPeople",
}
