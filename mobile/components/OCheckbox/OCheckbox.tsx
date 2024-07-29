import {Text, View, StyleSheet, ViewStyle, StyleProp} from "react-native";
import Checkbox from "expo-checkbox";
import * as React from "react";

interface IOCheckboxProps {
    label: string
    checkboxState: boolean
    onValueChange: (value: boolean) => void;
    style?: StyleProp<ViewStyle>
}

export const OCheckbox = (props: IOCheckboxProps) => {
    const {label, onValueChange, checkboxState} = props
    return <View style={[styles.checkboxField, props.style]}>
        <Checkbox value={checkboxState} onValueChange={onValueChange}/>
        <Text style={styles.checkboxLabel}>
            {label}
        </Text>
    </View>
}

const styles = StyleSheet.create({
    checkboxField: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 10,
    },
})