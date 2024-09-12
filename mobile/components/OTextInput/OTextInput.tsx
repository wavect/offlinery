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

interface IOTextInputProps extends TextInputProps {
    containerStyle?: StyleProp<ViewStyle>;
    topLabel?: string;
    bottomLabel?: string;
    isBottomLabelError?: boolean;
}

export const OTextInput = (props: IOTextInputProps) => {
    const {
        topLabel,
        bottomLabel,
        isBottomLabelError,
        secureTextEntry,
        containerStyle,
    } = props;
    const [isSecureTextVisible, setIsSecureTextVisible] =
        useState(!secureTextEntry);

    const toggleSecureEntry = () => {
        setIsSecureTextVisible(!isSecureTextVisible);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {topLabel && <Text style={styles.topLabel}>{topLabel}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={secureTextEntry && !isSecureTextVisible}
                    placeholderTextColor="#999"
                    {...props}
                />
                {secureTextEntry && (
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
            {bottomLabel && (
                <Text
                    style={[
                        styles.bottomLabel,
                        isBottomLabelError ? styles.bottomLabelError : null,
                    ]}
                >
                    {bottomLabel}
                </Text>
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
    bottomLabel: {
        color: Color.gray,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        marginTop: 5,
        alignSelf: "flex-start",
    },
    bottomLabelError: {
        color: Color.red,
        fontFamily: FontFamily.montserratSemiBold,
    },
});
