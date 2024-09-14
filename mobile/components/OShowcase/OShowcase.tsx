import { StyledMaterialIcon } from "@/styles/Icon.styles";
import { StyledText } from "@/styles/Text.styles";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface IOShowcaseProps {
    subtitle: string;
    onlyUseSystemFont?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

export const OShowcase = (props: IOShowcaseProps) => {
    const { subtitle, containerStyle } = props;

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.headlineContainer}>
                <StyledMaterialIcon name="wifi-off" />
                <StyledText.Title white>offlinery</StyledText.Title>
            </View>
            <StyledText.Subtitle white bold>
                {subtitle}
            </StyledText.Subtitle>
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
