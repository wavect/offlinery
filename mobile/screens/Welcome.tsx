import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { AuthApi, SignInResponseDTO, UserPrivateDTO } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OShowcase } from "@/components/OShowcase/OShowcase";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTroubleSignIn } from "@/components/OTroubleSignIn/OTroubleSignIn";
import {
    EACTION_USER,
    IUserData,
    MapRegion,
    isAuthenticated,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { jwtExpiresSoon } from "@/utils/misc.utils";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "./routes";

const authApi = new AuthApi();

const Welcome = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            /**
             * TO TEST THE FLOW, RESET THE TOKENS HERE
             */
            const storedRefreshToken = await getSecurelyStoredValue(
                SECURE_VALUE.JWT_REFRESH_TOKEN,
            );
            const storedAccessToken = await getSecurelyStoredValue(
                SECURE_VALUE.JWT_ACCESS_TOKEN,
            );

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

                console.log("refreshing token...");
                const refreshToken = await saveValueLocallySecurely(
                    SECURE_VALUE.JWT_ACCESS_TOKEN,
                    refreshResponse.accessToken,
                );
                const jwtAccessToken = await saveValueLocallySecurely(
                    SECURE_VALUE.JWT_REFRESH_TOKEN,
                    refreshResponse.refreshToken,
                );

                console.log(
                    `Updated new tokens: ${refreshToken} ${jwtAccessToken}`,
                );
            } else {
                // user has a valid access token
                console.log("JWT found. Trying JWT Authentication.");
                const signInRes = await authApi.authControllerSignInByJWT({
                    signInJwtDTO: {
                        jwtAccessToken: storedAccessToken!,
                    },
                });

                if (signInRes.accessToken) {
                    console.log("JWT authentication succeeded.");
                    userAuthenticatedUpdate(
                        signInRes.user,
                        signInRes.accessToken,
                        signInRes.refreshToken,
                    );
                }
            }
        } catch (e) {
            await saveValueLocallySecurely(SECURE_VALUE.JWT_ACCESS_TOKEN, "");
            await saveValueLocallySecurely(SECURE_VALUE.JWT_REFRESH_TOKEN, "");
            console.log("Forcing user to re-login.");
        }

        return isAuthenticated(state);
    };

    /**
     * Called after the user did a sign-in.
     * This stores the JWT and the REFRESH_TOKEN into the secure storage.
     * ---
     * @param user
     * @param jwtAccessToken
     * @param refreshToken
     */
    const userAuthenticatedUpdate = (
        user: UserPrivateDTO,
        jwtAccessToken: string,
        refreshToken: string,
    ) => {
        const userData: IUserData = {
            ...user,
            approachFromTime: new Date(user.approachFromTime),
            approachToTime: new Date(user.approachToTime),
            blacklistedRegions: user.blacklistedRegions
                .map((br) => {
                    if (br.location.coordinates?.length !== 2) {
                        return undefined;
                    }

                    return {
                        radius: br.radius,
                        longitude: br.location.coordinates[0],
                        latitude: br.location.coordinates[1],
                    } satisfies MapRegion;
                })
                .filter((br) => br !== undefined),
            clearPassword: "",
            imageURIs: Object.fromEntries(
                user.imageURIs.map((value, index) => [index, value]),
            ),
            jwtAccessToken,
        };
        // also fill userData when logged in
        // Note: We still save the accessToken into the user context to avoid reading from secure storage all the time when making api requests (performance, security, ..)
        const payload: Partial<IUserData> = {
            ...userData,
            jwtAccessToken,
            refreshToken,
        };

        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload,
        });

        if (user.verificationStatus === "pending") {
            navigation.navigate(ROUTES.Onboarding.WaitingVerification);
        } else {
            navigation.navigate(ROUTES.MainTabView);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const checkAuthentication = async () => {
                try {
                    // Assuming you have a function to check authentication status
                    const isAuthenticated = await checkAuthStatus();

                    if (isAuthenticated) {
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

    /** @dev Status auth status loaded, but false */
    const AuthScreen = () => (
        <>
            <OTermsDisclaimer />

            <OButtonWide
                filled={true}
                text={i18n.t(TR.createAccount)}
                style={{ marginBottom: 14 }}
                onPress={() => navigation.navigate(ROUTES.Onboarding.Email)}
                variant="light"
            />
            <OButtonWide
                filled={false}
                text={i18n.t(TR.signIn)}
                style={{ marginBottom: 90 }}
                variant="light"
                onPress={() => navigation.navigate(ROUTES.Login)}
            />

            <OTroubleSignIn style={styles.troubleSigningInFlexBox} />
        </>
    );

    const LoadingScreen = () => {
        return (
            <>
                <ActivityIndicator size="large" color={Color.white} />
                <Text style={styles.loadingText}>
                    {i18n.t(TR.gettingReadyToAmazeYou)}
                </Text>
            </>
        );
    };

    return (
        <OLinearBackground>
            <View
                style={[
                    styles.layoutContainer,
                    isLoading ? { justifyContent: "center" } : null,
                ]}
            >
                <OShowcase subtitle={i18n.t(TR.stopSwipingMeetIrl)} />

                {isLoading && <LoadingScreen />}
                {!isLoading && !isAuthenticated(state) && <AuthScreen />}
            </View>
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    troubleSigningInFlexBox: {
        display: "flex",
        letterSpacing: 0,
        color: Color.white,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 22,
        width: "88%",
        height: 45,
    },
    termsText: {
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
    },
    loadingText: {
        fontFamily: FontFamily.montserratRegular,
        color: Color.white,
        marginTop: 12,
    },
    termsLink: {
        textDecorationLine: "underline",
    },
    termsContainer: {
        width: "100%",
    },
    termsContainerOuter: {
        fontSize: FontSize.size_sm,
        marginBottom: 25,
        lineHeight: 20,
        width: 341,
        height: 81,
        textShadowColor: "rgba(0, 0, 0, 0.25)",
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowRadius: 4,
    },
    noWifi1Icon: {
        left: 0,
        width: 53,
        height: 44,
    },
    offlinery: {
        left: 53,
        fontSize: 48,
        fontWeight: "600",
        fontFamily: FontFamily.montserratRegular,
        width: 216,
        height: 54,
        lineHeight: 52,
        display: "flex",
        color: Color.white,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    welcome1: {
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 4,
        elevation: 4,
        shadowOpacity: 1,
        height: 926,
        backgroundColor: "transparent",
        overflow: "hidden",
        width: "100%",
        flex: 1,
    },
    layoutContainer: {
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
});

export default Welcome;
