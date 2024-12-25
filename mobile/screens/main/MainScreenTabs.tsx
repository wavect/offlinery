import { Color, Title } from "@/GlobalStyles";
import { OGoLiveToggle } from "@/components/OGoLiveToggle/OGoLiveToggle";
import { OPageHeader } from "@/components/OPageHeader/OPageHeader";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useSetupTourGuides } from "@/hooks/useSetupTourGuides";
import { TR, i18n } from "@/localization/translate.service";
import { MainTabs } from "@/screens/main/MainScreenTabs.navigator";
import { MOCK_ENCOUNTER } from "@/services/tourguide.service";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { TourGuideZone } from "rn-tourguide";
import { ROUTES } from "../routes";
import { EncounterScreenStack } from "./EncounterStackNavigator";
import FindPeople from "./FindPeople";
import ProfileSettings from "./ProfileSettings";

export const MainScreenTabs = ({ navigation }: any) => {
    useNotifications(navigation);

    const { dispatch: dispatchEncounters } = useEncountersContext();
    const { tourKeyFind, startTourFind } = useSetupTourGuides();

    return (
        <MainTabs.Navigator
            screenOptions={() => ({
                headerTitle: "",
                headerTitleStyle: Title,
                headerStyle: { height: 110 },
                headerTitleAlign: "left",
                tabBarActiveTintColor: Color.white,
                tabBarLabelStyle: { marginBottom: 5 },
                tabBarActiveBackgroundColor: Color.primary,
                headerShadowVisible: false,
                headerRight: () => (
                    <TourGuideZone
                        zone={1}
                        tourKey={tourKeyFind}
                        text={i18n.t(TR.tourToggle)}
                        shape="rectangle"
                    >
                        <OGoLiveToggle style={{ marginRight: 10 }} />
                    </TourGuideZone>
                ),
            })}
        >
            <MainTabs.Screen
                name={ROUTES.Main.FindPeople}
                component={FindPeople}
                options={{
                    tabBarLabel: i18n.t(TR.findPeople),
                    headerLeft: () => (
                        <OPageHeader
                            title={i18n.t(TR.findPeople)}
                            onHelpPress={() => {
                                requestAnimationFrame(() => {
                                    startTourFind();
                                });
                            }}
                        />
                    ),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="location-history"
                            size={size}
                            color={color}
                        />
                    ),
                    tabBarTestID: "tab-find-people",
                }}
            />
            <MainTabs.Screen
                name={ROUTES.Main.EncountersTab}
                component={EncounterScreenStack}
                options={{
                    tabBarLabel: i18n.t(TR.encounters),
                    headerLeft: () => (
                        <OPageHeader
                            title={i18n.t(TR.encounters)}
                            onHelpPress={() => {
                                dispatchEncounters({
                                    type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                                    payload: [MOCK_ENCOUNTER(null)],
                                });
                            }}
                        />
                    ),
                    // tabBarBadge:
                    // unreadNotifications.length === 0
                    //     ? undefined
                    //     : unreadNotifications.length,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="emoji-people"
                            size={size}
                            color={color}
                        />
                    ),
                    tabBarTestID: "tab-encounters",
                }}
            />
            <MainTabs.Screen
                name={ROUTES.Main.ProfileSettings}
                component={ProfileSettings}
                options={{
                    tabBarLabel: i18n.t(TR.settings),
                    headerTitle: i18n.t(TR.settings),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="settings"
                            size={size}
                            color={color}
                        />
                    ),
                    tabBarTestID: "tab-settings",
                }}
            />
        </MainTabs.Navigator>
    );
};
