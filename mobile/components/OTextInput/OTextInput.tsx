import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { useState } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { TextInputProps } from "react-native/Libraries/Components/TextInput/TextInput";
import OErrorMessage from "../OErrorMessage.tsx/OErrorMessage";

interface IOTextInputProps extends Omit<TextInputProps, "secureTextEntry"> {
    containerStyle?: StyleProp<ViewStyle>;
    topLabel?: string;
    bottomLabel?: string;
    isBottomLabelError?: boolean;
    isSensitiveInformation?: boolean;
    showCharacterCount?: boolean;
}

export const OTextInput = (props: IOTextInputProps) => {
    const {
        topLabel,
        bottomLabel,
        isBottomLabelError,
        isSensitiveInformation,
        containerStyle,
        showCharacterCount,
        maxLength,
        onChangeText,
        value,
        ...rest
    } = props;

    const [inputValue, setInputValue] = useState(value || "");
    const [isSecureTextVisible, setIsSecureTextVisible] = useState(
        !isSensitiveInformation,
    );
    const [characterCount, setCharacterCount] = useState(value?.length ?? 0);

    const toggleSecureEntry = () => {
        setIsSecureTextVisible(!isSecureTextVisible);
    };

    const handleInputChange = (text: string) => {
        if (maxLength && text.length > maxLength) return;
        setCharacterCount(text.length);
        setInputValue(text);
        onChangeText && onChangeText(text);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {topLabel && <Text style={styles.topLabel}>{topLabel}</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={
                        isSensitiveInformation && !isSecureTextVisible
                    }
                    placeholderTextColor="#999"
                    onChangeText={handleInputChange}
                    value={inputValue}
                    maxLength={maxLength}
                    {...rest}
                />
                {isSensitiveInformation && (
                    <TouchableOpacity
                        onPress={toggleSecureEntry}
                        style={styles.eyeIcon}
                    >
                        <MaterialIcons
                            name={
                                isSecureTextVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                            size={24}
                            color="#999"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {showCharacterCount && maxLength && (
                <Text style={styles.characterCount}>
                    {characterCount}/{maxLength}
                </Text>
            )}

            {bottomLabel && isBottomLabelError ? (
                <OErrorMessage
                    style={[styles.bottomLabelError]}
                    errorMessage={bottomLabel}
                    show
                />
            ) : (
                <Text style={styles.bottomLabel}>{bottomLabel}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        width: "100%",
    },
    eyeIcon: {
        padding: 4,
    },
    container: {
        width: "90%",
        alignItems: "center",
    },
    topLabel: {
        color: Color.gray,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratSemiBold,
        marginBottom: 5,
        alignSelf: "flex-start",
    },
    characterCount: {
        alignSelf: "flex-end",
        color: Color.gray,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        marginTop: 5,
    },
    bottomLabel: {
        color: Color.gray,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        marginTop: 5,
        alignSelf: "flex-start",
    },
    bottomLabelError: {
        marginTop: 5,
        alignSelf: "flex-start",
    },
});
