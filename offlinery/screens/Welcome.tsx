import * as React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Color, FontSize, FontFamily } from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import { OLinearBackground } from "../components/OLinearBackground/OLinearBackground";

const Welcome = () => {
    return (
        <OLinearBackground>
            <View style={[styles.createaccount, styles.signinFlexBox]}>
                <View style={[styles.stateLayer, styles.signinFlexBox]}>
                    <Text style={styles.labelText}>CREATE ACCOUNT</Text>
                </View>
            </View>
            <View style={[styles.signin, styles.signinFlexBox]}>
                <View style={[styles.stateLayer, styles.signinFlexBox]}>
                    <Text style={styles.labelText1}>SIGN IN</Text>
                </View>
            </View>
            <Text style={[styles.troubleSigningIn, styles.troubleSigningInFlexBox]}>
                Trouble signing in?
            </Text>
            <Text
                style={[
                    styles.byTappingCreateContainer,
                    styles.troubleSigningInFlexBox,
                ]}
            >
                <Text style={styles.byTappingCreateContainer1}>
                    <Text style={styles.byTappingCreateAccountOr}>
                        {`By tapping “Create account” or “Sign in”, you agree to our `}
                    </Text>
                    <Text style={styles.byTappingCreateAccountOr}>
                        <Text style={styles.terms1}>Terms</Text>
                    </Text>
                    <Text style={styles.byTappingCreateAccountOr}>
                        {`. See how we process your data in our `}
                    </Text>
                    <Text style={styles.byTappingCreateAccountOr}>
                        <Text style={styles.terms1}>Privacy and Cookie Policy</Text>
                    </Text>
                    <Text style={styles.byTappingCreateAccountOr}>.</Text>
                </Text>
            </Text>

            <OShowcase subtitle="Stop Swiping. Meet IRL." />
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    signinFlexBox: {
        justifyContent: "center",
        alignItems: "center",
    },
    troubleSigningInFlexBox: {
        display: "flex",
        letterSpacing: 0,
        color: Color.m3White,
        textAlign: "center",
        alignItems: "center",
        position: "absolute",
    },

    labelText: {
        color: "#36797d",
        textAlign: "center",
        lineHeight: 28,
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
    },
    stateLayer: {
        alignSelf: "stretch",
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingVertical: 10,
        alignItems: "center",
        flex: 1,
    },
    createaccount: {
        top: 651,
        left: 22,
        backgroundColor: Color.m3White,
        width: 382,
        height: 64,
        borderRadius: 100,
        alignItems: "center",
        position: "absolute",
        overflow: "hidden",
    },
    labelText1: {
        color: Color.m3White,
        textAlign: "center",
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        lineHeight: 28,
        fontSize: FontSize.size_xl,
    },
    signin: {
        top: 741,
        left: 23,
        backgroundColor: Color.stateLayersSurfaceDimOpacity08,
        borderStyle: "solid",
        borderColor: Color.m3White,
        borderWidth: 1,
        width: 383,
        height: 65,
        borderRadius: 100,
        alignItems: "center",
        position: "absolute",
        overflow: "hidden",
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
    byTappingCreateAccountOr: {
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
    },
    terms1: {
        textDecorationLine: "underline",
    },
    byTappingCreateContainer1: {
        width: "100%",
    },
    byTappingCreateContainer: {
        top: 551,
        left: 43,
        fontSize: FontSize.m3LabelLarge_size,
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
        color: Color.m3White,
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
