import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    GestureResponderEvent,
    Pressable,
    StyleProp,
    Text,
    ViewStyle,
} from "react-native";
import oButtonWideStyles from "./OButtonWide.styles";

type StyleVariant = "dark" | "light";

interface IOButtonWideProps {
    text: string;
    filled: boolean;
    variant: StyleVariant;
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    countdownEnableSeconds?: number;
    isLoading?: boolean;
    /** @dev Override button text in loading state */
    loadingBtnText?: string;
}

const getButtonStyle = (
    isDisabled: boolean,
    filled: boolean,
    variant: StyleVariant,
): StyleProp<ViewStyle> => {
    if (filled) {
        if (isDisabled) return oButtonWideStyles.buttonFilledDisabled;
        return variant === "dark"
            ? oButtonWideStyles.buttonFilledDark
            : oButtonWideStyles.buttonFilledLight;
    } else {
        const baseStyle = [oButtonWideStyles.buttonOutlined];
        if (isDisabled)
            return [...baseStyle, oButtonWideStyles.buttonOutlinedDisabled];
        return [
            ...baseStyle,
            variant === "dark"
                ? oButtonWideStyles.buttonOutlinedDark
                : oButtonWideStyles.buttonOutlinedLight,
        ];
    }
};

const getLabelStyle = (
    isDisabled: boolean,
    filled: boolean,
    variant: StyleVariant,
) => {
    if (isDisabled) {
        return filled
            ? oButtonWideStyles.btnDisabledLabelDark
            : oButtonWideStyles.btnDisabledLabelLight;
    }
    if (filled) {
        return variant === "dark"
            ? oButtonWideStyles.btnFilledLabelDark
            : oButtonWideStyles.btnFilledLabelLight;
    }
    return variant === "dark"
        ? oButtonWideStyles.btnOutlineLabelDark
        : oButtonWideStyles.btnOutlineLabelLight;
};

export const OButtonWide: React.FC<IOButtonWideProps> = ({
    loadingBtnText,
    isLoading,
    text,
    filled,
    variant,
    onPress,
    style,
    disabled = false,
    countdownEnableSeconds = 0,
}) => {
    const [countdown, setCountdown] = useState(countdownEnableSeconds);
    const [isBtnCountdownActive, setIsBtnCountdownActive] = useState(
        countdownEnableSeconds > 0,
    );

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        clearInterval(timer);
                        setIsBtnCountdownActive(false);
                        return 0;
                    }
                    return prevCount - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [countdown]);

    const buttonText = isBtnCountdownActive ? `${text} (${countdown})` : text;
    const isDisabled = disabled || isBtnCountdownActive;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={[
                getButtonStyle(isDisabled, filled, variant),
                oButtonWideStyles.button,
                style,
            ]}
        >
            <Text style={getLabelStyle(isDisabled, filled, variant)}>
                {isLoading ? (
                    <>
                        <ActivityIndicator
                            size="small"
                            style={{ marginRight: 6 }}
                        />
                        {(loadingBtnText || buttonText).toUpperCase()}
                    </>
                ) : (
                    buttonText.toUpperCase()
                )}
            </Text>
        </Pressable>
    );
};
