import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { ROUTES } from "./screens/routes";

const Stack = createStackNavigator();

import Splash from "./screens/Splash";
import Welcome from "./screens/Welcome";

import { createStackNavigator } from "@react-navigation/stack";

import {
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    useFonts,
} from "@expo-google-fonts/montserrat";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Color } from "./GlobalStyles";
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

const DEFAULT_SCREEN_PROPS = {
    headerShown: true,
    headerShadowVisible: false,
    headerTitle: "",
    headerBackTitle: "Back",
};
const DEFAULT_LIGHT_SCREEN_PROPS = {
    ...DEFAULT_SCREEN_PROPS,
    headerTransparent: true,
    headerTintColor: Color.white,
};
const NO_HEADER = { headerShown: false };

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    let [appIsReady] = useFonts({
        Montserrat_100Thin,
        Montserrat_200ExtraLight,
        Montserrat_300Light,
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,
    });

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
        // TODO: this is using montserrat fonts, we might want to allow the splash screen to fall back to nice looking Arial or other default fonts, css fix likely
        return <Splash />;
    }

    return (
        <GlobalErrorHandler>
            <NavigationContainer>
                <UserProvider>
                    <Stack.Navigator
                        initialRouteName={ROUTES.Welcome}
                        screenOptions={NO_HEADER}
                    >
                        <Stack.Screen
                            name={ROUTES.Welcome}
                            component={Welcome}
                            options={NO_HEADER}
                        />
                        <Stack.Screen
                            name={ROUTES.Login}
                            component={Login}
                            options={DEFAULT_LIGHT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.HouseRules}
                            component={HouseRules}
                            options={DEFAULT_LIGHT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.Email}
                            component={Email}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.VerifyEmail}
                            component={VerifyEmail}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.Password}
                            component={Password}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.FirstName}
                            component={FirstName}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.BirthDay}
                            component={Birthday}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.GenderChoice}
                            component={GenderChoice}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.GenderLookingFor}
                            component={GenderLookingFor}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.ApproachChoice}
                            component={ApproachChoice}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.SafetyCheck}
                            component={SafetyCheck}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.BookSafetyCall}
                            component={BookSafetyCall}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.AddPhotos}
                            component={AddPhotos}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.DontApproachMeHere}
                            component={DontApproachMeHere}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.ApproachMeBetween}
                            component={ApproachMeBetween}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.BioLetThemKnow}
                            component={BioLetThemKnow}
                            options={DEFAULT_SCREEN_PROPS}
                        />
                        <Stack.Screen
                            name={ROUTES.Onboarding.WaitingVerification}
                            component={WaitingForVerification}
                            options={NO_HEADER}
                        />
                        <Stack.Screen
                            name={ROUTES.MainTabView}
                            component={MainScreenTabs}
                            options={NO_HEADER}
                        />
                    </Stack.Navigator>
                </UserProvider>
            </NavigationContainer>
        </GlobalErrorHandler>
    );
}
