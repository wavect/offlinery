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
        <EncounterStack.Navigator
            initialRouteName={ROUTES.Main.EncountersStack}
            screenOptions={NO_HEADER}
        >
            <EncounterStack.Screen
                name={ROUTES.Main.EncountersStack}
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
                    headerBackTitle: "",
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
                    headerBackTitle: "",
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
                    headerBackTitle: "",
                    headerTitleAlign: "left",
                }}
            />
        </EncounterStack.Navigator>
    );
});
