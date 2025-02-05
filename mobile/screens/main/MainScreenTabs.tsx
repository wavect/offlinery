import { Color, Title } from "@/GlobalStyles";
import { OGoLiveToggle } from "@/components/OGoLiveToggle/OGoLiveToggle";
import { OPageHeader } from "@/components/OPageHeader/OPageHeader";
import { OPageHeaderEncounters } from "@/components/OPageHeader/OPageHeaderEncounters/OPageHeaderEncounters";
import { useNotifications } from "@/hooks/useNotifications";
import { TR, i18n } from "@/localization/translate.service";
import { MainTabs } from "@/screens/main/MainScreenTabs.navigator";
import { LOCAL_VALUE, getLocalValue } from "@/services/storage.service";
import { TOURKEY } from "@/services/tourguide.service";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
import { ROUTES } from "../routes";
import { EncounterScreenStack } from "./EncounterStackNavigator";
import FindPeople from "./FindPeople";
import ProfileSettings from "./ProfileSettings";

export const MainScreenTabs = ({ navigation }: any) => {
    const { unseenEncountersCount, setUnseenEncountersCount } =
        useNotifications({ navigation });

    const { tourKey: tourKeyFind, start: startTourFind } =
        useTourGuideController(TOURKEY.FIND);

    // @dev true by default to not unnecessarily distract user
    const [hasDoneFindWalkthrough, setHasDoneFindWalkthrough] = useState(true);

    useEffect(() => {
        getLocalValue(LOCAL_VALUE.HAS_DONE_FIND_WALKTHROUGH)
            .then((value: boolean) => {
                setHasDoneFindWalkthrough(value);
            })
            .catch((err) => {
                Sentry.captureException(err, {
                    tags: {
                        mainScreenTabs: "getLocalValue:hasDoneWalkthrough",
                    },
                });
            });
    }, []);

    return (
        <MainTabs.Navigator
            screenOptions={() => ({
                headerTitle: "",
                headerTitleStyle: Title,
                headerStyle: Platform.select({
                    ios: { height: 120 },
                }),
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
                            highlightHelpBtn={!hasDoneFindWalkthrough}
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
                    tabBarButtonTestID: "tab-find-people",
                }}
            />
            <MainTabs.Screen
                name={ROUTES.Main.EncountersTab}
                component={EncounterScreenStack}
                listeners={{
                    tabPress: () => {
                        setUnseenEncountersCount(0); // @dev reset all unseen encounters once tab clicked
                    },
                }}
                options={{
                    tabBarLabel: i18n.t(TR.encounters),
                    headerLeft: () => <OPageHeaderEncounters />,
                    tabBarBadge:
                        unseenEncountersCount === 0
                            ? undefined
                            : unseenEncountersCount,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="emoji-people"
                            size={size}
                            color={color}
                        />
                    ),
                    tabBarButtonTestID: "tab-encounters",
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
                    tabBarButtonTestID: "tab-settings",
                }}
            />
        </MainTabs.Navigator>
    );
};
