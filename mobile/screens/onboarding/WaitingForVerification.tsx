import { A } from "@expo/html-elements";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Color, FontFamily, FontSize } from "../../GlobalStyles";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { OLinearBackground } from "../../components/OLinearBackground/OLinearBackground";
import { OShowcase } from "../../components/OShowcase/OShowcase";
import { EVerificationStatus, useUserContext } from "../../context/UserContext";
import { i18n, TR } from "../../localization/translate.service";
import { ROUTES } from "../routes";

const WaitingForVerification = ({ navigation }) => {
    const { state } = useUserContext();
    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>
                <OShowcase subtitle={i18n.t(TR.stopSwipingMeetIrl)} />

                <OButtonWide
                    filled={true}
                    text={i18n.t(TR.verificationInProgress)}
                    style={{ marginBottom: 14 }}
                    disabled={
                        state.verificationStatus !==
                        EVerificationStatus.VERIFIED
                    }
                    onPress={() => navigation.navigate(ROUTES.Main.HeatMap)}
                    variant="light"
                />

                <OButtonWide
                    filled={false}
                    text={i18n.t(TR.bookNewCall)}
                    variant="light"
                    style={{ marginBottom: 15 }}
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.BookSafetyCall)
                    }
                />
                <Text style={styles.subtitleBookCall}>
                    {i18n.t(TR.pleaseDoNotMakeDoubleBookings)}
                </Text>

                <A
                    href="mailto:office@wavect.io"
                    style={[styles.bottomText, styles.bottomTextContainer]}
                >
                    {i18n.t(TR.somethingWrongQ)}
                </A>
            </View>
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    subtitleBookCall: {
        fontSize: FontSize.size_md,
        color: Color.white,
        marginBottom: 80,
    },
    bottomTextContainer: {
        display: "flex",
        letterSpacing: 0,
        color: Color.white,
        textAlign: "center",
        alignItems: "center",
    },
    bottomText: {
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
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
});

export default WaitingForVerification;
