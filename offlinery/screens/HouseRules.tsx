import * as React from "react";
import {Text, StyleSheet, View} from "react-native";
import {Color, FontSize, FontFamily, Padding, BorderRadius} from "../GlobalStyles";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../components/OButtonWide/OButtonWide";
import {A} from '@expo/html-elements';
import {ROUTES} from "./routes";

const HouseRules = ({navigation}) => {

    // TODO: SHOW HEADER WITH BACK BTN ETC
    return (
        <OLinearBackground>
           <OShowcase subtitle="Stop Swiping. Meet IRL." />

            <View style={[styles.createaccount, styles.stateLayerFlexBox]}>
                <View style={[styles.stateLayer, styles.stateLayerFlexBox]}>
                    <Text style={[styles.labelText, styles.dontTypo1]}>I UNDERSTAND</Text>
                </View>
            </View>
            <View style={styles.checkParent}>
                <Image
                    style={[styles.checkIcon, styles.checkIconLayout]}
                    resizeMode="cover"
                    source={require("../assets/img/check.svg")}
                />
                <Text style={[styles.beRespectful, styles.beAuthenticTypo]}>
                    Be Respectful.
                </Text>
                <Text style={[styles.weveA0, styles.weveA0Typo]}>
                    We’ve a 0 tolerance for disrespectful behavior.
                </Text>
            </View>
            <View style={[styles.checkGroup, styles.checkLayout]}>
                <Image
                    style={[styles.checkIcon, styles.checkIconLayout]}
                    resizeMode="cover"
                    source={require("../assets/img/check.svg")}
                />
                <Text style={[styles.beRespectful, styles.beAuthenticTypo]}>
                    Accept a No.
                </Text>
                <Text style={[styles.dontBePushy, styles.dontBePushyTypo]}>
                    Don’t be pushy. If there is no vibe, accept it.
                </Text>
            </View>
            <View style={[styles.checkContainer, styles.checkLayout]}>
                <Image
                    style={[styles.checkIcon, styles.checkIconLayout]}
                    resizeMode="cover"
                    source={require("../assets/img/check.svg")}
                />
                <Text style={[styles.beAuthentic, styles.beAuthenticTypo]}>
                    Be authentic.
                </Text>
                <Text style={[styles.beYourselfTrust, styles.dontBePushyTypo]}>
                    Be yourself. Trust us, it works.
                </Text>
            </View>
            <Image
                style={[styles.checkIcon3, styles.checkIconLayout]}
                resizeMode="cover"
                source={require("../assets/img/check.svg")}
            />
            <Text style={[styles.dontWaitDont, styles.dontTypo1]}>
                Don’t wait. Don’t make it weird.
            </Text>
            <Text style={[styles.approachImmediatelyDont, styles.dontTypo]}>
                Approach immediately. Don’t observe and  watch. Just be casual and
                polite.
            </Text>
            <Text style={[styles.violatingTheseRulesContainer, styles.weveA0Typo]}>
                <Text style={styles.violatingTheseRulesContainer1}>
                    <Text
                        style={styles.violatingTheseRules}
                    >{`Violating these rules blocks you from using this  app for at least `}</Text>
                    <Text style={styles.dontTypo2}>12 months</Text>
                    <Text style={styles.violatingTheseRules}>. We have no mercy.</Text>
                </Text>
            </Text>
            <View style={styles.groupView}>
                <Image
                    style={[styles.checkIcon, styles.checkIconLayout]}
                    resizeMode="cover"
                    source={require("../assets/img/check.svg")}
                />
                <Text style={[styles.beRespectful, styles.beAuthenticTypo]}>
                    Don’t rush it.
                </Text>
                <Text style={[styles.dontTryTo, styles.dontTypo]}>
                    Don’t try to “close”. Have a good time,  the rest follows naturally.
                </Text>
            </View>
        </OLinearBackground>
    );
};


const styles = StyleSheet.create({
    houseRulesShadowBox: {
        overflow: "hidden",
            shadowOpacity: 1,
            elevation: 4,
            shadowRadius: 4,
            shadowOffset: {
            width: 0,
                height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    stateLayerFlexBox: {
        justifyContent: "center",
            alignItems: "center",
    },
    iconPosition: {
        left: 0,
            top: 0,
    },
    dontTypo2: {
        fontFamily: FontFamily.montserratSemiBold,
            fontWeight: "600",
    },
    dontTypo1: {
        lineHeight: 28,
            fontSize: FontSize.size_xl,
            textAlign: "center",
    },
    checkIconLayout: {
        height: 31,
            width: 31,
            position: "absolute",
    },
    beAuthenticTypo: {
        top: 1,
            lineHeight: 28,
            fontSize: FontSize.size_xl,
            fontFamily: FontFamily.montserratSemiBold,
            fontWeight: "600",
            textAlign: "center",
            color: Color.m3White,
            position: "absolute",
    },
    weveA0Typo: {
        fontSize: FontSize.size_base,
            lineHeight: 28,
            textAlign: "center",
            color: Color.m3White,
            position: "absolute",
    },
    checkLayout: {
        height: 59,
            position: "absolute",
    },
    dontBePushyTypo: {
        top: 31,
            fontFamily: FontFamily.montserratRegular,
            fontSize: FontSize.size_base,
            lineHeight: 28,
            textAlign: "center",
            color: Color.m3White,
            position: "absolute",
    },
    dontTypo: {
        textAlign: "left",
            fontFamily: FontFamily.montserratRegular,
            fontSize: FontSize.size_base,
            lineHeight: 28,
            color: Color.m3White,
            position: "absolute",
    },
    stopSwipingMeet: {
        top: 161,
            left: 19,
            fontSize: 22,
            lineHeight: 44,
            width: 390,
            height: 61,
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            color: Color.m3White,
            fontFamily: FontFamily.montserratMedium,
            fontWeight: "500",
            position: "absolute",
    },
    noWifi1Icon: {
        width: 53,
            height: 44,
            position: "absolute",
    },
    offlinery: {
        left: 53,
            fontSize: 48,
            lineHeight: 52,
            width: 216,
            top: 0,
            fontWeight: "600",
            height: 54,
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            textAlign: "center",
            color: Color.m3White,
            position: "absolute",
    },
    noWifi1Parent: {
        top: 117,
            left: 79,
            width: 269,
            height: 54,
            position: "absolute",
    },
    labelText: {
        color: "#36797d",
            lineHeight: 28,
            fontSize: FontSize.size_xl,
            fontFamily: FontFamily.montserratMedium,
            fontWeight: "500",
    },
    stateLayer: {
        alignSelf: "stretch",
            flexDirection: "row",
            paddingHorizontal: Padding.p_5xl,
            paddingVertical: Padding.p_3xs,
            flex: 1,
    },
    createaccount: {
        top: 784,
            left: 27,
            borderRadius: BorderRadius.br_81xl,
            backgroundColor: Color.m3White,
            width: 382,
            height: 64,
            position: "absolute",
            overflow: "hidden",
            shadowOpacity: 1,
            elevation: 4,
            shadowRadius: 4,
            shadowOffset: {
            width: 0,
                height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    checkIcon: {
        left: 0,
            top: 0,
    },
    beRespectful: {
        left: 44,
    },
    weveA0: {
        fontFamily: FontFamily.montserratRegular,
            left: 5,
            top: 29,
    },
    checkParent: {
        top: 269,
            width: 372,
            height: 57,
            left: 28,
            position: "absolute",
    },
    dontBePushy: {
        left: 5,
    },
    checkGroup: {
        top: 358,
            width: 351,
            left: 28,
    },
    beAuthentic: {
        left: 46,
    },
    beYourselfTrust: {
        left: 7,
    },
    checkContainer: {
        top: 449,
            left: 26,
            width: 240,
    },
    checkIcon3: {
        top: 657,
            left: 30,
    },
    dontWaitDont: {
        top: 658,
            left: 72,
            fontFamily: FontFamily.montserratSemiBold,
            fontWeight: "600",
            color: Color.m3White,
            lineHeight: 28,
            fontSize: FontSize.size_xl,
            position: "absolute",
    },
    approachImmediatelyDont: {
        top: 688,
            left: 33,
    },
    violatingTheseRules: {
        fontFamily: FontFamily.montserratRegular,
    },
    violatingTheseRulesContainer1: {
        width: "100%",
    },
    violatingTheseRulesContainer: {
        top: 857,
            left: -16,
            width: 468,
            alignItems: "center",
            fontSize: FontSize.size_base,
            display: "flex",
    },
    dontTryTo: {
        left: 5,
            top: 29,
    },
    groupView: {
        top: 540,
            width: 309,
            height: 85,
            left: 28,
            position: "absolute",
    },
    icon: {
        height: "100%",
            width: "100%",
    },
    back: {
        left: 13,
            top: 15,
            width: 40,
            height: 38,
            position: "absolute",
    },
    houseRules: {
        height: 926,
            backgroundColor: "transparent",
            width: "100%",
            flex: 1,
    },
});

export default HouseRules;
