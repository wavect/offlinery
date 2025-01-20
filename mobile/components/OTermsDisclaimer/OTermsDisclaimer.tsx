import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { TR, i18n } from "@/localization/translate.service";
import { AGB_URL, GDPR_URL } from "@/utils/general.constants";
import { A } from "@expo/html-elements";
import * as React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface IOTermsDisclaimerProps {
    style?: StyleProp<ViewStyle>;
}

export const OTermsDisclaimer = (props: IOTermsDisclaimerProps) => {
    return (
        <View style={[styles.termsContainerOuter, props.style]}>
            <Text style={styles.termsText}>
                {i18n.t(TR.termsDisclaimer.p1)}
                <A href={AGB_URL} style={styles.termsLink}>
                    {i18n.t(TR.termsDisclaimer.terms)}
                </A>
                {i18n.t(TR.termsDisclaimer.p2)}
                <A href={GDPR_URL} style={styles.termsLink}>
                    {i18n.t(TR.termsDisclaimer.privacyCookie)}
                </A>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    termsText: {
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        fontSize: FontSize.size_sm,
        color: Color.white,
        lineHeight: 20,
        textAlign: "center",
    },
    termsLink: {
        textDecorationLine: "underline",
    },
    termsContainerOuter: {
        marginBottom: 25,
        minHeight: 81,
        letterSpacing: 0,
        color: Color.white,
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        lineHeight: 24,
        width: "88%",
        height: "auto",
    },
});
