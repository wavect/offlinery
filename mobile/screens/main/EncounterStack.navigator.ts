import { EncounterPublicDTO, UserPublicDTO } from "@/api/gen/src";
import { ROUTES } from "@/screens/routes";
import { createStackNavigator } from "@react-navigation/stack";
import { ReactNode } from "react";

export type EncounterStackParamList = {
    [ROUTES.Main.EncountersStack]: undefined;
    [ROUTES.Main.ReportEncounter]: { personToReport: EncounterPublicDTO };
    [ROUTES.Main.NavigateToApproach]: { navigateToPerson: EncounterPublicDTO };
    [ROUTES.Main.ProfileView]: {
        user: UserPublicDTO;
        bottomContainerChildren?: ReactNode;
    };
};
export const EncounterStack = createStackNavigator<EncounterStackParamList>();
