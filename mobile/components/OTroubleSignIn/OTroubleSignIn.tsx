import { Color, FontFamily } from "@/GlobalStyles";
import { TR, i18n } from "@/localization/translate.service";
import { SUPPORT_MAIL } from "@/utils/general.constants";
import * as React from "react";
import { Linking, StyleSheet, Text } from "react-native";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface IOTroubleSignIn {
    style?: StyleProp<TextStyle>;
}

export const OTroubleSignIn = (props: IOTroubleSignIn) => {
    const writeSupportEmail = async () => {
        await Linking.openURL(`mailto:${SUPPORT_MAIL}`);
    };

    return (
        <Text
            style={[styles.troubleSigningIn, props.style]}
            onPress={writeSupportEmail}
        >
            {i18n.t(TR.troubleSignIn)}
        </Text>
    );
};

const styles = StyleSheet.create({
    troubleSigningIn: {
        fontSize: 16,
        lineHeight: 24,
        marginTop: 10,
        textDecorationLine: "underline",
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        color: Color.white,
        textAlign: "center",
    },
});
