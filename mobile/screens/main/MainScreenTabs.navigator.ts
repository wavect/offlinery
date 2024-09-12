import { ROUTES } from "@/screens/routes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

export type MainScreenTabsParamList = {
    [ROUTES.Main.FindPeople]: undefined;
    [ROUTES.Main.Encounters]: undefined;
    [ROUTES.Main.ProfileSettings]: undefined;
    [ROUTES.MainTabView]: {
        screen:
            | typeof ROUTES.Main.FindPeople
            | typeof ROUTES.Main.Encounters
            | typeof ROUTES.Main.ProfileSettings
            | typeof ROUTES.Main.NavigateToApproach;
        params?: any;
    };
};
export const MainTabs = createBottomTabNavigator<MainScreenTabsParamList>();
