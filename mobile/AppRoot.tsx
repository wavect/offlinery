import {
    NavigationContainer,
    NavigationContainerRef,
} from "@react-navigation/native";
import * as React from "react";
import { ROUTES } from "./screens/routes";

import Welcome from "./screens/Welcome";

import { TR, i18n } from "@/localization/translate.service";
import ResetPassword from "@/screens/ResetPassword";
import AppIntroductionSwiperScreen from "@/screens/onboarding/AppIntroductionSlider";
import { getDeviceUserHasSeenIntro } from "@/services/storage.service";
import { navigationIntegration, setupSentry } from "@/utils/sentry.utils";
import {
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { TourGuideProvider } from "rn-tourguide";
import { Color, FontSize } from "./GlobalStyles";
import { MainStack } from "./MainStack.navigator";
import { EncountersProvider } from "./context/EncountersContext";
import { UserProvider } from "./context/UserContext";
import HouseRules from "./screens/HouseRules";
import Login from "./screens/Login";
import { MainScreenTabs } from "./screens/main/MainScreenTabs";
import AddPhotos from "./screens/onboarding/AddPhotos";
import ApproachChoice from "./screens/onboarding/ApproachChoice";
import ApproachMeBetween from "./screens/onboarding/ApproachMeBetween";
import BioLetThemKnow from "./screens/onboarding/BioLetThemKnow";
import Birthday from "./screens/onboarding/Birthday";
import BookSafetyCall from "./screens/onboarding/BookSafetyCall";
import DontApproachMeHere from "./screens/onboarding/DontApproachMeHere";
import Email from "./screens/onboarding/Email";
import FirstName from "./screens/onboarding/FirstName";
import GenderChoice from "./screens/onboarding/GenderChoice";
import GenderLookingFor from "./screens/onboarding/GenderLookingFor";
import IntentionChoice from "./screens/onboarding/IntentionChoice";
import Password from "./screens/onboarding/Password";
import SafetyCheck from "./screens/onboarding/SafetyCheck";
import VerifyEmail from "./screens/onboarding/VerifyEmail";
import WaitingForVerification from "./screens/onboarding/WaitingForVerification";
import GlobalErrorHandler from "./services/global-error.service";

setupSentry(false);

const BackIcon = ({ color }: { color: string }) => (
    <MaterialIcons
        name="arrow-back-ios-new"
        size={25}
        style={{ marginLeft: 10 }}
        color={color}
    />
);

const DEFAULT_SCREEN_PROPS = {
    headerShown: true,
    headerShadowVisible: false,
    headerTitle: "",
    headerBackImage: () => <BackIcon color={Color.primary} />,
    headerBackTitle: " ", // @dev Needs whitespace otherwise default title used
    headerTintColor: Color.primary,
    headerTitleStyle: {
        fontSize: FontSize.size_xl,
        textAlign: "left",
    } as const,
};
const DEFAULT_LIGHT_SCREEN_PROPS = {
    ...DEFAULT_SCREEN_PROPS,
    headerTransparent: true,
    headerBackImage: () => <BackIcon color={Color.white} />,
    headerTintColor: Color.white,
};
const NO_HEADER = { headerShown: false };

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [hasSeenIntro, setHasSeenIntro] = useState(false);

    let [fontsLoaded] = useFonts({
        Montserrat_300Light,
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
    });

    const navContainerRef = useRef<NavigationContainerRef<any>>(null);

    useEffect(() => {
        async function prepare() {
            try {
                // Pre-load any resources here
                setHasSeenIntro(await getDeviceUserHasSeenIntro());
                // Wait for fonts to load
                await fontsLoaded;

                setAppIsReady(true);
            } catch (e) {
                console.warn(e);
            }
        }

        prepare();
    }, [fontsLoaded]);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady && fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady, fontsLoaded]);

    if (!appIsReady || !fontsLoaded) {
        return null;
    }

    /** @DEV Custom 4-Slider on App Start is shown to the user if unseen */
    const initialComponent = hasSeenIntro
        ? ROUTES.Welcome
        : ROUTES.Onboarding.AppIntroductionSlider;

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <GlobalErrorHandler>
                <NavigationContainer
                    ref={navContainerRef}
                    onReady={() => {
                        if (!__DEV__) {
                            navigationIntegration.registerNavigationContainer(
                                navContainerRef,
                            );
                        }
                    }}
                >
                    <UserProvider>
                        <EncountersProvider>
                            <TourGuideProvider
                                {...{
                                    labels: {
                                        previous: i18n.t(TR.tourPrevious),
                                        next: i18n.t(TR.tourNext),
                                        skip: i18n.t(TR.tourSkip),
                                        finish: i18n.t(TR.tourFinish),
                                    },
                                    backdropColor: "rgba(54, 121, 125, 0.9)",
                                }}
                            >
                                <MainStack.Navigator
                                    initialRouteName={
                                        ROUTES.Onboarding.SafetyCheck
                                    }
                                    screenOptions={NO_HEADER}
                                >
                                    <MainStack.Screen
                                        name={
                                            ROUTES.Onboarding
                                                .AppIntroductionSlider
                                        }
                                        component={AppIntroductionSwiperScreen}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Welcome}
                                        component={Welcome}
                                        options={NO_HEADER}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Login}
                                        component={Login}
                                        options={DEFAULT_LIGHT_SCREEN_PROPS}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.HouseRules}
                                        component={HouseRules}
                                        options={DEFAULT_LIGHT_SCREEN_PROPS}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.Email}
                                        component={Email}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.whatIsYourEmail,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.VerifyEmail}
                                        component={VerifyEmail}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.enterVerificationCode,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.Password}
                                        component={Password}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.yourPassword,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.ResetPassword}
                                        component={ResetPassword}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.resetPassword,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.FirstName}
                                        component={FirstName}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.myFirstNameIs,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.BirthDay}
                                        component={Birthday}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.myBirthDayIs,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.GenderChoice}
                                        component={GenderChoice}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.iAmA),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={
                                            ROUTES.Onboarding.GenderLookingFor
                                        }
                                        component={GenderLookingFor}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.iLookFor),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.ApproachChoice}
                                        component={ApproachChoice}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.iWantTo),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={
                                            ROUTES.Onboarding.IntentionsChoice
                                        }
                                        component={IntentionChoice}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.iWantA),
                                        }}
                                    />

                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.SafetyCheck}
                                        component={SafetyCheck}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.safetyCheck),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.BookSafetyCall}
                                        component={BookSafetyCall}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.bookSafetyCall,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.AddPhotos}
                                        component={AddPhotos}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.addPhotos),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={
                                            ROUTES.Onboarding.DontApproachMeHere
                                        }
                                        component={DontApproachMeHere}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.dontApproachHere,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={
                                            ROUTES.Onboarding.ApproachMeBetween
                                        }
                                        component={ApproachMeBetween}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(
                                                TR.approachMeBetween,
                                            ),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.Onboarding.BioLetThemKnow}
                                        component={BioLetThemKnow}
                                        options={{
                                            ...DEFAULT_SCREEN_PROPS,
                                            headerTitle: i18n.t(TR.letThemKnow),
                                        }}
                                    />
                                    <MainStack.Screen
                                        name={
                                            ROUTES.Onboarding
                                                .WaitingVerification
                                        }
                                        component={WaitingForVerification}
                                        options={NO_HEADER}
                                    />
                                    <MainStack.Screen
                                        name={ROUTES.MainTabView}
                                        component={MainScreenTabs}
                                        options={NO_HEADER}
                                    />
                                </MainStack.Navigator>
                            </TourGuideProvider>
                        </EncountersProvider>
                    </UserProvider>
                </NavigationContainer>
            </GlobalErrorHandler>
        </View>
    );
}
