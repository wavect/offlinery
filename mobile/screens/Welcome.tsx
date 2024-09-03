import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OShowcase } from "@/components/OShowcase/OShowcase";
import { OTermsDisclaimer } from "@/components/OTermsDisclaimer/OTermsDisclaimer";
import { OTroubleSignIn } from "@/components/OTroubleSignIn/OTroubleSignIn";
import { isAuthenticated, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "./routes";

const Welcome = ({ navigation }) => {
    const { state, dispatch } = useUserContext();

    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        // This could be a call to your authentication service or a check in local storage
        // For now, we'll use the state.isAuthenticated
        // TODO local cache? api call etc

        return isAuthenticated(state);
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
            <OTermsDisclaimer style={styles.troubleSigningInFlexBox} />

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
