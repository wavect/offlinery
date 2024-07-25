import * as React from "react";
import {Text, StyleSheet} from "react-native";
import {Color, FontSize, FontFamily} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {A} from '@expo/html-elements';
import {ROUTES} from "./routes";

const Welcome = ({navigation}) => {
    return (
        <OLinearBackground>
            <OButtonWide filled={true} text="Create Account" onPress={() => navigation.navigate(ROUTES.Onboarding.Email)}/>
            <OButtonWide filled={false} text="Sign in"/>
            <Text style={[styles.troubleSigningIn, styles.troubleSigningInFlexBox]}>
                Trouble signing in?
            </Text>
            <Text
                style={[
                    styles.termsContainerOuter,
                    styles.troubleSigningInFlexBox,
                ]}
            >
                <Text style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        {`By tapping “Create account” or “Sign in”, you agree to our `}
                        <A href="https://wavect.io/imprint" style={styles.termsLink}>Terms</A>
                        {`. See how we process your data in our `}
                        <A href="https://wavect.io/imprint" style={styles.termsLink}>Privacy and Cookie Policy.</A>
                    </Text>
                </Text>
            </Text>

            <OShowcase subtitle="Stop Swiping. Meet IRL."/>
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
        position: "absolute",
    },
    troubleSigningIn: {
        top: 852,
        left: 99,
        fontSize: 16,
        lineHeight: 24,
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
    termsLink: {
        textDecorationLine: "underline",
    },
    termsContainer: {
        width: "100%",
    },
    termsContainerOuter: {
        top: 551,
        left: 43,
        fontSize: FontSize.size_sm,
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
    datingAppsAre: {
        top: 411,
        left: 29,
        fontSize: 22,
        width: 370,
        height: 63,
        letterSpacing: 0,
        lineHeight: 52,
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        position: "absolute",
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
    noWifi1Parent: {
        top: 367,
        left: 78,
        width: 269,
        height: 54,
        position: "absolute",
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
});

export default Welcome;
