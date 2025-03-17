import { Color, FontSize } from "@/GlobalStyles";
import Checkbox from "expo-checkbox";
import * as React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface IOCheckboxProps {
    label: string;
    checkboxState: boolean;
    onValueChange: (value: boolean) => void;
    style?: StyleProp<ViewStyle>;
}

export const OCheckbox = (props: IOCheckboxProps) => {
    const { label, onValueChange, checkboxState } = props;
    return (
        <View style={[styles.checkboxField, props.style]}>
            <Checkbox
                value={checkboxState}
                onValueChange={onValueChange}
                color={Color.primary}
            />
            <Text style={styles.checkboxLabel}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    checkboxField: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkboxLabel: {
        flex: 1,
        fontSize: FontSize.size_sm,
        color: Color.gray,
        marginLeft: 10,
    },
});
