import {memo} from "react";
import {ROUTES} from "../routes";
import {EncountersProvider} from "../../context/EncountersContext";
import Encounters from "./Encounters";
import ReportEncounter from "./ReportEncounter";
import {i18n, TR} from "../../localization/translate.service";
import NavigateToApproach from "./NavigateToApproach";
import ProfileView from "./ProfileView";
import * as React from "react";
import {createStackNavigator} from "@react-navigation/stack";

const EncounterStack = createStackNavigator();

interface IEncounterStackProps {
    route?: {
        params?: {
            initialRouteName?: string
        }
    }
}

const NO_HEADER = {headerShown: false}
export const EncounterScreenStack = memo(({route}: IEncounterStackProps) => {
        const initialRouteName = route?.params?.initialRouteName ?? ROUTES.Main.Encounters;
        return <EncountersProvider>
            <EncounterStack.Navigator
                initialRouteName={initialRouteName}
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
                headerTitleAlign: 'left'
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
                headerTitleAlign: 'left'
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
                headerTitleAlign: 'left'
        }}
        />
        </EncounterStack.Navigator>
        </EncountersProvider>
    }
)