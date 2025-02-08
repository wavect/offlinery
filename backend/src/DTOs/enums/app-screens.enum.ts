/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

/** @dev To ensure screens are properly typed on frontend. The Enum Values should be the same as in the routes on mobile! */
export enum EAppScreens {
    NAVIGATE_TO_APPROACH = "Main_NavigateToApproach",
    NEW_EVENT = "Main_FindPeople",
    ACCOUNT_VERIFIED = "Main_FindPeople",
    GHOSTMODE_REMINDER = "Main_FindPeople",
    SAFETYCALL_REMINDER = "Main_FindPeople",
    ACCOUNT_DENIED = "Main_FindPeople",
    NEW_MESSAGE = "Main_Encounters_onTab",
    DID_YOU_MEET = "Main_Encounters_onTab",
    SAFETY_CALL_MISSED = "Welcome", // @dev do not send to pendingVerification or FindPeople since user might have switched to BeApproached or not (let app decide)
}
