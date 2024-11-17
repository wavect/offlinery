import { UserPublicDTO } from "@/api/gen/src";
import { ROUTES } from "@/screens/routes";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { createStackNavigator } from "@react-navigation/stack";
import { ReactNode } from "react";

export type EncounterStackParamList = {
    [ROUTES.Main.EncountersStack]: undefined;
    [ROUTES.Main.ReportEncounter]: { personToReport: IEncounterProfile };
    [ROUTES.Main.NavigateToApproach]: { navigateToPerson: IEncounterProfile };
    [ROUTES.Main.ProfileView]: {
        user: UserPublicDTO;
        bottomContainerChildren?: ReactNode;
    };
};
export const EncounterStack = createStackNavigator<EncounterStackParamList>();
