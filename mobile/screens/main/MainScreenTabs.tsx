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
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
import { ROUTES } from "../routes";
import { EncounterScreenStack } from "./EncounterStackNavigator";
import FindPeople from "./FindPeople";
import ProfileSettings from "./ProfileSettings";

export const MainScreenTabs = ({ navigation }: any) => {
    useNotifications(navigation);
    const [tourEncounterInitialized, setTourEncounterInitialized] =
        useState(false);

    const {
        eventEmitter: eventEmitterFind,
        canStart: canStartTourFind,
        tourKey: tourKeyFind,
        start: startTourFind,
    } = useTourGuideController(TOURKEY.FIND);

    const {
        eventEmitter: eventEmitterEncounters,
        canStart: canStartTourEncounters,
        start: startTourEncounters,
    } = useTourGuideController(TOURKEY.ENCOUNTERS);

    useEffect(() => {
        const handleStop = () => {
            setTourEncounterInitialized(false);
        };

        const handleSkip = () => {
            setTourEncounterInitialized(false);
        };

        if (eventEmitterFind || eventEmitterEncounters) {
            if (eventEmitterFind) {
                eventEmitterFind.on("stop", handleStop);
                eventEmitterFind.on("skip", handleSkip);
            }

            if (eventEmitterEncounters) {
                eventEmitterEncounters.on("stop", handleStop);
                eventEmitterEncounters.on("skip", handleSkip);
            }

            // Cleanup listeners
            return () => {
                if (eventEmitterFind) {
                    eventEmitterFind.off("stop", handleStop);
                    eventEmitterFind.off("skip", handleSkip);
                }
                if (eventEmitterEncounters) {
                    eventEmitterEncounters.off("stop", handleStop);
                    eventEmitterEncounters.off("skip", handleSkip);
                }
            };
        }
    }, [eventEmitterFind, eventEmitterEncounters]);

    // @dev true by default to not unnecessarily distract user
    const [hasDoneFindWalkthrough, setHasDoneFindWalkthrough] = useState(true);
    useEffect(() => {
        if (canStartTourEncounters && !tourEncounterInitialized) {
            requestAnimationFrame(() => {
                startTourEncounters();
                setTourEncounterInitialized(true);
            });
        }
    }, [canStartTourEncounters, startTourEncounters, tourEncounterInitialized]);

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
                    tabBarTestID: "tab-find-people",
                }}
            />
            <MainTabs.Screen
                name={ROUTES.Main.EncountersTab}
                component={EncounterScreenStack}
                options={{
                    tabBarLabel: i18n.t(TR.encounters),
                    headerLeft: () => <OPageHeaderEncounters />,
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
