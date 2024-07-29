import * as React from "react";
import {Text, StyleSheet, View, ActivityIndicator} from "react-native";
import {Color, FontSize, FontFamily} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {A} from '@expo/html-elements';
import {ROUTES} from "./routes";
import {useUserContext} from "../context/UserContext";
import {useCallback, useEffect, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";
import {sleep} from "../utils/misc.utils";
import {OTermsDisclaimer} from "../components/OTermsDisclaimer/OTermsDisclaimer";

const Welcome = ({navigation}) => {
    const {state, dispatch} = useUserContext()

    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        // This could be a call to your authentication service or a check in local storage
        // For now, we'll use the state.isAuthenticated
        // TODO local cache? api call etc

        await sleep(2000) // TODO REMOVE
        return state.isAuthenticated;
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
                    console.error('Error checking authentication:', error);
                    setIsLoading(false);
                }
            };

            checkAuthentication();
        }, [navigation])
    );

    /** @dev Status auth status loaded, but false */
    const AuthScreen = () => <>
        <OTermsDisclaimer style={styles.troubleSigningInFlexBox} />

        <OButtonWide filled={true} text="Create Account" style={{marginBottom: 14}}
                     onPress={() => navigation.navigate(ROUTES.Onboarding.Email)} variant="light"/>
        <OButtonWide filled={false} text="Sign in" style={{marginBottom: 90}} variant="light"
                     onPress={() => navigation.navigate(ROUTES.Login)}/>

        <Text style={[styles.troubleSigningIn, styles.troubleSigningInFlexBox]}>
            Trouble signing in?
        </Text>
    </>

    const LoadingScreen = () => {
        return <>
            <ActivityIndicator size="large" color={Color.white}/>
            <Text style={styles.loadingText}>Getting ready to amaze you..</Text>
        </>
    }


    return (
        <OLinearBackground>
            <View style={[styles.layoutContainer, isLoading ? {justifyContent: 'center'} : null]}>
                <OShowcase subtitle="Stop Swiping. Meet IRL."/>

                {isLoading && <LoadingScreen/>}
                {!isLoading && !state.isAuthenticated && <AuthScreen/>}
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
    },
    troubleSigningIn: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 22,
        width: 230,
        height: 45,
        textDecorationLine: "underline",
        fontFamily: FontFamily.montserratLight,
        display: "flex",
        fontWeight: "500",
        justifyContent: "center",
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
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
});


export default Welcome;
