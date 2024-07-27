import {StyleProp, StyleSheet, TextInput, ViewStyle} from "react-native";
import * as React from "react";

interface IOTextInputProps {
    value: string;
    setValue: React.Dispatch<string>
    placeholder: string
    style?: StyleProp<ViewStyle>;
}

export const OTextInput = (props: IOTextInputProps) => {
    const {value, setValue, placeholder, style} = props;

    return <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#999"
    />
}

const styles = StyleSheet.create({
    inputField: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
})

