import {ROUTES} from "./screens/routes";

const Stack = createStackNavigator();
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";

import Splash from "./screens/Splash";
import Welcome from './screens/Welcome';

import { createStackNavigator } from "@react-navigation/stack";

import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Montserrat_100Thin,
  Montserrat_200ExtraLight,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import Email from "./screens/onboarding/Email";
import ApproachChoice from "./screens/onboarding/ApproachChoice";

export default function App() {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHideSplashScreen(true);
    }, 1000);
  }, []);

  let [fontsLoaded] = useFonts({
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

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
        <NavigationContainer>
          {hideSplashScreen ? (
              <Stack.Navigator
                  initialRouteName="Welcome"
                  screenOptions={{ headerShown: false }}
              >
                <Stack.Screen
                    name={ROUTES.Welcome}
                    component={Welcome}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name={ROUTES.Onboarding.Email}
                    component={Email}
                    options={{ headerShown: true, headerShadowVisible: false, headerTitle: ""}}
                />
                <Stack.Screen
                    name={ROUTES.Onboarding.ApproachChoice}
                    component={ApproachChoice}
                    options={{ headerShown: true, headerShadowVisible: false, headerTitle: ""}}
                />
              </Stack.Navigator>
          ) : (
              <Splash />
          )}
        </NavigationContainer>
    );
  }
};
