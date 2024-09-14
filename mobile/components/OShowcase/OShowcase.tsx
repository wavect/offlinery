import { Color } from "@/GlobalStyles";
import { StyledText } from "@/styles/Text.styles";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

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
                <MaterialIcons name="wifi-off" size={45} color={Color.white} />
                <StyledText.Title>offlinery</StyledText.Title>
            </View>
            <StyledText.Subtitle>{subtitle}</StyledText.Subtitle>
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
});

export default OShowcase;
