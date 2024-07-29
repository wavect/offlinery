import {StyleProp, StyleSheet, TextInput, ViewStyle} from "react-native";
import * as React from "react";

interface IOTextInputProps {
    value: string;
    setValue: React.Dispatch<string>
    placeholder: string
    style?: StyleProp<ViewStyle>;
    multiline?: boolean
}

export const OTextInput = (props: IOTextInputProps) => {
    const {value, setValue, placeholder, style, multiline} = props;

    return <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        multiline={multiline}
        placeholderTextColor="#999"
    />
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
})

