import * as React from "react";
import {Text, StyleSheet, View} from "react-native";
import {Color, FontSize, FontFamily} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {A} from '@expo/html-elements';
import {ROUTES} from "./routes";

const Welcome = ({navigation}) => {
    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>
                <OShowcase subtitle="Stop Swiping. Meet IRL."/>

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

                <OButtonWide filled={true} text="Create Account" style={{marginBottom: 14}}
                             onPress={() => navigation.navigate(ROUTES.Onboarding.Email)} variant="light"/>
                <OButtonWide filled={false} text="Sign in" style={{marginBottom: 90}} variant="light"/>

                <Text style={[styles.troubleSigningIn, styles.troubleSigningInFlexBox]}>
                    Trouble signing in?
                </Text>
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
