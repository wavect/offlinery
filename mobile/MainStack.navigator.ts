import { ROUTES } from "@/screens/routes";
import { createStackNavigator } from "@react-navigation/stack";

export type MainStackParamList = {
    [ROUTES.Welcome]: undefined;
    [ROUTES.Login]: undefined;
    [ROUTES.HouseRules]: {
        forceWaitSeconds?: number;
        nextPage: any;
        propsForNextScreen?: any;
    };
    [ROUTES.Onboarding.Email]: { errorMessage: string } | undefined;
    [ROUTES.Onboarding.VerifyEmail]: undefined;
    [ROUTES.Onboarding.Password]:
        | { isChangePassword: boolean; nextPage: any }
        | undefined;
    [ROUTES.ResetPassword]: undefined;
    [ROUTES.Onboarding.FirstName]: undefined;
    [ROUTES.Onboarding.BirthDay]: undefined;
    [ROUTES.Onboarding.GenderChoice]: undefined;
    [ROUTES.Onboarding.GenderLookingFor]: undefined;
    [ROUTES.Onboarding.ApproachChoice]: undefined;
    [ROUTES.Onboarding.IntentionsChoice]: undefined;
    [ROUTES.Onboarding.SafetyCheck]: undefined;
    [ROUTES.Onboarding.BookSafetyCall]: { onCallBooked: Function };
    [ROUTES.Onboarding.AddPhotos]:
        | { overrideSaveBtnLbl: string; overrideOnBtnPress: () => void }
        | undefined;
    [ROUTES.Onboarding.ApproachMeBetween]: undefined;
    [ROUTES.Onboarding.DontApproachMeHere]: undefined;
    [ROUTES.Onboarding.BioLetThemKnow]: undefined;
    [ROUTES.Onboarding.WaitingVerification]: { overrideLabel?: string };
    [ROUTES.Onboarding.AppIntroductionSlider]: undefined;
    [ROUTES.MainTabView]: undefined;
};
export const MainStack = createStackNavigator<MainStackParamList>();
