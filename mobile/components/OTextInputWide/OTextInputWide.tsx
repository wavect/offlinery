import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
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

interface IOTextInputWideProps extends TextInputProps {
    containerStyle?: StyleProp<ViewStyle>;
    topLabel?: string;
    bottomLabel?: string;
    isBottomLabelError?: boolean;
}

export const OTextInputWide = (props: IOTextInputWideProps) => {
    const {
        secureTextEntry,
        isBottomLabelError,
        containerStyle,
        topLabel,
        bottomLabel,
    } = props;

    const [isSecureTextVisible, setIsSecureTextVisible] =
        useState(!secureTextEntry);

    const toggleSecureEntry = () => {
        setIsSecureTextVisible(!isSecureTextVisible);
    };

    return (
        <View style={styles.container}>
            {topLabel && <Text style={styles.topLabel}>{topLabel}</Text>}
            <View style={[styles.inputContainer, containerStyle]}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={secureTextEntry && !isSecureTextVisible}
                    placeholderTextColor={Color.white}
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
                            color={Color.white}
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
    container: {
        width: "90%",
        alignItems: "center",
    },
    topLabel: {
        color: Color.white,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratSemiBold,
        marginBottom: 5,
        alignSelf: "flex-start",
    },
    bottomLabel: {
        color: Color.white,
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
        alignSelf: "flex-start",
        marginBottom: 12,
        marginTop: 6,
    },
    bottomLabelError: {
        color: Color.lightOrange,
        fontFamily: FontFamily.montserratSemiBold,
    },
    input: {
        flex: 1,
        lineHeight: 28,
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        padding: 6,
        color: Color.white,
    },
    eyeIcon: {
        padding: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 65,
        borderRadius: 5,
        overflow: "hidden",
        backgroundColor: Color.stateLayersSurfaceDimOpacity08,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: Color.white,
    },
});
