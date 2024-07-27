import * as React from "react";
import {Text, StyleSheet, View} from "react-native";
import {Color, FontSize, FontFamily} from "../../GlobalStyles";
import {OShowcase} from "../../components/OShowcase/OShowcase";
import {OLinearBackground} from "../../components/OLinearBackground/OLinearBackground";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {A} from '@expo/html-elements';
import {ROUTES} from "../routes";
import {useUserContext} from "../../context/UserContext";

const WaitingForVerification = ({navigation}) => {
    const {state} = useUserContext()
    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>
                <OShowcase subtitle="Stop Swiping. Meet IRL."/>

                <OButtonWide filled={true} text="Verification in progress.." style={{marginBottom: 14}} disabled={!state.isVerified}/>
                    {/*onPress={() => navigation.navigate(ROUTES.Onboarding.Email)} variant="light"/>*/}
                <OButtonWide filled={false} text="Book new call" style={{marginBottom: 90}} variant="light"
                             onPress={() => navigation.navigate(ROUTES.Onboarding.BookSafetyCall)}/>

                <Text style={[styles.bottomText, styles.bottomTextContainer]}>
                    Something wrong?
                </Text>
            </View>

        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
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
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
});


export default WaitingForVerification;
