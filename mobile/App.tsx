import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { ROUTES } from "./screens/routes";

import Splash from "./screens/Splash";
import Welcome from "./screens/Welcome";

import { TR, i18n } from "@/localization/translate.service";
import {
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Color, FontSize } from "./GlobalStyles";
import { MainStack } from "./MainStack.navigator";
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
import Password from "./screens/onboarding/Password";
import SafetyCheck from "./screens/onboarding/SafetyCheck";
import VerifyEmail from "./screens/onboarding/VerifyEmail";
import WaitingForVerification from "./screens/onboarding/WaitingForVerification";
import GlobalErrorHandler from "./services/global-error.service";

Sentry.init({
    dsn: "https://580af3edb138d4a6c73999e61efbe013@o4507911356743680.ingest.de.sentry.io/4507911361003600",

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // enableSpotlight: __DEV__,
});

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

export default function App() {
    let [appIsReady] = useFonts({
        Montserrat_300Light,
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        /* @dev If you need any of these, then make sure to add them in app.json
        Montserrat_100Thin,
        Montserrat_200ExtraLight,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,*/
    });

    useEffect(() => {
        async function prepare() {
            // Keep the splash screen visible while we fetch resources
            await SplashScreen.preventAutoHideAsync();
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            // This tells the splash screen to hide immediately! If we call this after
            // `setAppIsReady`, then we may see a blank screen while the app is
            // loading its initial state and rendering its first pixels. So instead,
            // we hide the splash screen once we know the root view has already
            // performed layout.
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        // @dev Uses system fonts
        return <Splash />;
    }

    return (
        <GlobalErrorHandler>
            <NavigationContainer>
                <UserProvider>
                    <MainStack.Navigator
                        initialRouteName={ROUTES.Onboarding.GenderLookingFor}
                        screenOptions={NO_HEADER}
                    >
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
                                headerTitle: i18n.t(TR.whatIsYourEmail),
                            }}
                        />
                        <MainStack.Screen
                            name={ROUTES.Onboarding.VerifyEmail}
                            component={VerifyEmail}
                            options={{
                                ...DEFAULT_SCREEN_PROPS,
                                headerTitle: i18n.t(TR.enterVerificationCode),
                            }}
                        />
                        <MainStack.Screen
                            name={ROUTES.Onboarding.Password}
                            component={Password}
                            options={{
                                ...DEFAULT_SCREEN_PROPS,
                                headerTitle: i18n.t(TR.yourPassword),
                            }}
                        />
                        <MainStack.Screen
                            name={ROUTES.Onboarding.FirstName}
                            component={FirstName}
                            options={{
                                ...DEFAULT_SCREEN_PROPS,
                                headerTitle: i18n.t(TR.myFirstNameIs),
                            }}
                        />
                        <MainStack.Screen
                            name={ROUTES.Onboarding.BirthDay}
                            component={Birthday}
                            options={{
                                ...DEFAULT_SCREEN_PROPS,
                                headerTitle: i18n.t(TR.myBirthDayIs),
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
                            name={ROUTES.Onboarding.GenderLookingFor}
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
                                headerTitle: i18n.t(TR.bookSafetyCall),
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
                            name={ROUTES.Onboarding.DontApproachMeHere}
                            component={DontApproachMeHere}
                            options={{
                                ...DEFAULT_SCREEN_PROPS,
                                headerTitle: i18n.t(TR.dontApproachHere),
                            }}
                        />
                        <MainStack.Screen
                            name={ROUTES.Onboarding.ApproachMeBetween}
                            component={ApproachMeBetween}
                            options={{
                                ...DEFAULT_SCREEN_PROPS,
                                headerTitle: i18n.t(TR.approachMeBetween),
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
                            name={ROUTES.Onboarding.WaitingVerification}
                            component={WaitingForVerification}
                            options={NO_HEADER}
                        />
                        <MainStack.Screen
                            name={ROUTES.MainTabView}
                            component={MainScreenTabs}
                            options={NO_HEADER}
                        />
                    </MainStack.Navigator>
                </UserProvider>
            </NavigationContainer>
        </GlobalErrorHandler>
    );
}
