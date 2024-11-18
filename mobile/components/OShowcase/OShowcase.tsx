import { Color, FontFamily } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface IOShowcaseProps {
    subtitle: string;
    onlyUseSystemFont?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

export const OShowcase = (props: IOShowcaseProps) => {
    const { onlyUseSystemFont, subtitle, containerStyle } = props;
    const systemFontStyle = onlyUseSystemFont
        ? { fontFamily: undefined }
        : null;

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.headlineContainer}>
                {!onlyUseSystemFont && (
                    <MaterialIcons
                        name="wifi-off"
                        size={45}
                        color={Color.white}
                        style={{ margin: 0, padding: 0 }}
                    />
                )}
                <Text
                    style={[styles.headlineText, systemFontStyle]}
                    numberOfLines={1}
                >
                    offlinery
                </Text>
            </View>
            <Text
                style={[styles.subtitle, systemFontStyle]}
                adjustsFontSizeToFit={true}
                numberOfLines={1}
            >
                {subtitle}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    headlineContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    headlineText: {
        marginLeft: 12,
        fontSize: 48,
        lineHeight: 52,
        fontWeight: "600",
        fontFamily: FontFamily.montserratRegular,
        color: Color.white,
    },
    subtitle: {
        fontSize: 22,
        lineHeight: 44,
        fontWeight: "500",
        fontFamily: FontFamily.montserratLight,
        width: "100%",
        maxWidth: 390,
        textAlign: "center",
        color: Color.white,
    },
});

export default OShowcase;
