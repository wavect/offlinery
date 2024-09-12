import { EncountersProvider } from "@/context/EncountersContext";
import { i18n, TR } from "@/localization/translate.service";
import * as React from "react";
import { memo } from "react";
import { ROUTES } from "../routes";
import Encounters from "./Encounters";
import { EncounterStack } from "./EncounterStack.navigator";
import NavigateToApproach from "./NavigateToApproach";
import ProfileView from "./ProfileView";
import ReportEncounter from "./ReportEncounter";

const NO_HEADER = { headerShown: false };
export const EncounterScreenStack = memo(() => {
    return (
        <EncountersProvider>
            <EncounterStack.Navigator
                initialRouteName={ROUTES.Main.Encounters}
                screenOptions={NO_HEADER}
            >
                <EncounterStack.Screen
                    name={ROUTES.Main.Encounters}
                    component={Encounters}
                    options={NO_HEADER}
                />
                <EncounterStack.Screen
                    name={ROUTES.Main.ReportEncounter}
                    component={ReportEncounter}
                    options={{
                        headerShown: true,
                        headerShadowVisible: false,
                        headerTitle: i18n.t(TR.reportPerson),
                        headerBackTitleVisible: false,
                        headerTitleAlign: "left",
                    }}
                />
                <EncounterStack.Screen
                    name={ROUTES.Main.NavigateToApproach}
                    component={NavigateToApproach}
                    options={{
                        headerShown: true,
                        headerShadowVisible: false,
                        headerTitle: i18n.t(TR.meetIRL),
                        headerBackTitleVisible: false,
                        headerTitleAlign: "left",
                    }}
                />
                <EncounterStack.Screen
                    name={ROUTES.Main.ProfileView}
                    component={ProfileView}
                    options={{
                        headerShown: true,
                        headerShadowVisible: false,
                        headerTitle: i18n.t(TR.profileView),
                        headerBackTitleVisible: false,
                        headerTitleAlign: "left",
                    }}
                />
            </EncounterStack.Navigator>
        </EncountersProvider>
    );
});
