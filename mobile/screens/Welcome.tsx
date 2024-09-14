import { MainStackParamList } from "@/MainStack.navigator";
import { AuthApi, SignInResponseDTO } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageColorContainer } from "@/components/OPageColorContainer/OPageColorContainer";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTroubleSignIn } from "@/components/OTroubleSignIn/OTroubleSignIn";
import { isAuthenticated, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { userAuthenticatedUpdate } from "@/services/auth.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { jwtExpiresSoon } from "@/utils/misc.utils";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "./routes";

const authApi = new AuthApi();

const Welcome = ({
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.Welcome>) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const [storedRefreshToken, storedAccessToken] = await Promise.all([
                getSecurelyStoredValue(SECURE_VALUE.JWT_REFRESH_TOKEN),
                getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN),
            ]);

            if (!storedRefreshToken && !storedAccessToken) {
                console.log("No JWT or JWT_RT found, force re-login");
                return false;
            }

            if (jwtExpiresSoon(storedAccessToken!)) {
                console.log(
                    "Access token will expires soon, requesting new one...",
                );

                /**@DEV fix generator type bug */
                const refreshResponse: SignInResponseDTO =
                    (await authApi.authControllerRefreshJwtToken({
                        refreshJwtDTO: {
                            refreshToken: storedRefreshToken!,
                        },
                    })) as SignInResponseDTO;

                console.log("refresh token received: ", refreshResponse);

                saveValueLocallySecurely(
                    SECURE_VALUE.JWT_ACCESS_TOKEN,
                    refreshResponse.accessToken,
                );
                saveValueLocallySecurely(
                    SECURE_VALUE.JWT_REFRESH_TOKEN,
                    refreshResponse.refreshToken,
                );
                console.log("Tokens refreshed.");
            } else {
                // user has a valid access token
                console.log("JWT found, authenticating via JWT.");
                const signInRes = await authApi.authControllerSignInByJWT({
                    signInJwtDTO: {
                        jwtAccessToken: storedAccessToken!,
                    },
                });

                if (signInRes.accessToken) {
                    console.log("JWT authentication succeeded.");
                    userAuthenticatedUpdate(
                        dispatch,
                        navigation,
                        signInRes.user,
                        signInRes.accessToken,
                        signInRes.refreshToken,
                    );
                }
            }
        } catch (e) {
            saveValueLocallySecurely(SECURE_VALUE.JWT_ACCESS_TOKEN, "");
            saveValueLocallySecurely(SECURE_VALUE.JWT_REFRESH_TOKEN, "");
            console.log("Forcing user to re-login.");
        }

        return isAuthenticated(state);
    };
    useFocusEffect(
        useCallback(() => {
            const checkAuthentication = async () => {
                try {
                    const isAuthenticatedUser = await checkAuthStatus();
                    if (isAuthenticatedUser) {
                        navigation.replace(ROUTES.MainTabView);
                    } else {
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error("Error checking authentication:", error);
                    setIsLoading(false);
                }
            };

            checkAuthentication();
        }, [navigation]),
    );

    const AuthScreen = () => (
        <View style={styles.authContainer}>
            <OTermsDisclaimer />
            <View style={styles.buttonContainer}>
                <OButtonWide
                    filled={true}
                    text={i18n.t(TR.createAccount)}
                    onPress={() => navigation.navigate(ROUTES.Onboarding.Email)}
                    variant="light"
                />
                <OButtonWide
                    filled={false}
                    text={i18n.t(TR.signIn)}
                    variant="light"
                    onPress={() => navigation.navigate(ROUTES.Login)}
                />
            </View>
            <OTroubleSignIn style={styles.troubleSigningIn} />
        </View>
    );

    return (
        <OPageColorContainer isLoading={isLoading}>
            {!isAuthenticated(state) && <AuthScreen />}
        </OPageColorContainer>
    );
};

const { width, height } = Dimensions.get("window");
const aspectRatio = height / width;

const styles = StyleSheet.create({
    authContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: Platform.OS === "ios" ? "8%" : "5%",
    },
    buttonContainer: {
        width: "100%",
        paddingHorizontal: "5%",
        marginTop: aspectRatio > 1.6 ? "5%" : "2%",
    },
    button: {
        marginBottom: 14,
        width: "100%",
    },
    troubleSigningIn: {
        width: "90%",
        marginTop: aspectRatio > 1.6 ? 22 : 10,
    },
});

export default Welcome;
