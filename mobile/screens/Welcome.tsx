import { Color, FontFamily } from "@/GlobalStyles";
import { AuthApi, SignInResponseDTO } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OShowcase } from "@/components/OShowcase/OShowcase";
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
import { useFocusEffect, useTheme } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ROUTES } from "./routes";

const authApi = new AuthApi();

const Welcome = ({ navigation }) => {
    const { colors } = useTheme();
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
                    style={styles.button}
                />
                <OButtonWide
                    filled={false}
                    text={i18n.t(TR.signIn)}
                    variant="light"
                    onPress={() => navigation.navigate(ROUTES.Login)}
                    style={styles.button}
                />
            </View>
            <OTroubleSignIn style={styles.troubleSigningIn} />
        </View>
    );

    const LoadingScreen = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.white} />
            <Text style={[styles.loadingText, { color: Color.white }]}>
                {i18n.t(TR.gettingReadyToAmazeYou)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <OLinearBackground>
                <View style={styles.content}>
                    <OShowcase
                        subtitle={i18n.t(TR.stopSwipingMeetIrl)}
                        containerStyle={styles.showCaseStyle}
                    />
                    {isLoading ? (
                        <LoadingScreen />
                    ) : (
                        !isAuthenticated(state) && <AuthScreen />
                    )}
                </View>
            </OLinearBackground>
        </View>
    );
};

const { width, height } = Dimensions.get("window");
const aspectRatio = height / width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    showCaseStyle: {
        marginTop: height * 0.15,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        textAlign: "center",
        fontFamily: FontFamily.montserratLight,
    },
});

export default Welcome;
