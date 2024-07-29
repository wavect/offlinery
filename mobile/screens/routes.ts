export const ROUTES: any = {
    Welcome: 'Welcome',
    HouseRules: 'HouseRules',
    /** @dev MainTabView then manages the tab routes */
    MainTabView: 'Main_TabView',
    Login: 'Login',
    Main: {
        Encounters: 'Main_Encounters',
        ReportEncounter: 'Main_ReportEncounter',
        FindPeople: 'Main_FindPeople',
        ProfileSettings: 'Main_ProfileSettings',
    },
    Onboarding: {
        Email: 'Onboarding_Email',
        FirstName: 'Onboarding_Firstname',
        BirthDay: 'Onboarding_Birthday',
        GenderChoice: 'Onboarding_GenderChoice',
        GenderLookingFor: 'Onboarding_GenderLookingFor',
        ApproachChoice: 'Onboarding_ApproachChoice',
        SafetyCheck: 'Onboarding_SafetyCheck',
        BookSafetyCall: 'Onboarding_BookSafetyCall',
        AddPhotos: 'Onboarding_AddPhotos',
        WaitingVerification: 'Onboarding_WaitingVerification',
        // user should just blacklist their home for now if they want to, ILiveHere: 'Onboarding_ILiveHere',
        DontApproachMeHere: 'Onboarding_DontApproachMeHere',
        ApproachMeBetween: 'Onboarding_ApproachMeBetween',
        BioLetThemKnow: 'Onboarding_BioLetThemKnow',
    },
}
