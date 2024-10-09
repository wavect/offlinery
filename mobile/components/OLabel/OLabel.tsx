import { FontFamily } from "@/GlobalStyles"; // Adjust the import path as necessary
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OTooltip } from "../OTooltip/OTooltip";

interface OLabelProps {
    text: string;
    tooltipText?: string;
    iconName?: keyof typeof MaterialIcons.glyphMap;
}

export const OLabel: React.FC<OLabelProps> = ({
    text,
    tooltipText,
    iconName = "help-outline",
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{text}</Text>
            {tooltipText && (
                <OTooltip tooltipText={tooltipText} iconName={iconName} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: FontFamily.montserratSemiBold,
    },
});
