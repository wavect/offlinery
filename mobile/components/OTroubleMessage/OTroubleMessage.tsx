import { Color, FontFamily } from "@/GlobalStyles";
import * as React from "react";
import { StyleSheet, Text } from "react-native";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface IOTroubleMessage {
    style?: StyleProp<TextStyle>;
    action: () => void;
    label: string;
}

export const OTroubleMessage = (props: IOTroubleMessage) => {
    const { action, label } = props;
    return (
        <Text
            style={[styles.contactSupport, props.style]}
            onPress={action}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
        >
            {label}
        </Text>
    );
};

const styles = StyleSheet.create({
    contactSupport: {
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
