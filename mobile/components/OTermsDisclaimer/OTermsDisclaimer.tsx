import {StyleProp, StyleSheet, Text, ViewStyle} from "react-native";
import {A} from "@expo/html-elements";
import * as React from "react";
import {FontFamily, FontSize} from "../../GlobalStyles";

interface IOTermsDisclaimerProps {
    style?: StyleProp<ViewStyle>,
}

export const OTermsDisclaimer = (props: IOTermsDisclaimerProps) => {
    return <Text
        style={[
            styles.termsContainerOuter,
            props.style,
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
}


const styles = StyleSheet.create({
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
})