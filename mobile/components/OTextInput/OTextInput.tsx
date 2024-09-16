import { Color } from "@/GlobalStyles";
import { StyledMaterialIcon } from "@/styles/Icon.styles";
import {
    EyeIconButton,
    OTextInputContainer,
    OTextInputStyled,
} from "@/styles/Input.styles";
import { SText } from "@/styles/Text.styles";
import { FullWidthContainer } from "@/styles/View.styles";
import React, { useState } from "react";
import { TextInputProps } from "react-native";

interface IOTextInputProps extends Omit<TextInputProps, "secureTextEntry"> {
    topLabel?: string;
    bottomLabel?: string;
    isBottomLabelError?: boolean;
    isPassword?: boolean;
    variant?: "primary" | "white";
}

export const OTextInput: React.FC<IOTextInputProps> = ({
    topLabel,
    bottomLabel,
    isBottomLabelError,
    isPassword,
    variant = "primary",
    style,
    ...props
}) => {
    const [isSecureTextVisible, setIsSecureTextVisible] = useState(!isPassword);

    const toggleSecureEntry = () => {
        setIsSecureTextVisible(!isSecureTextVisible);
    };
    const getLabelProps = () =>
        variant === "white" ? { white: true } : { primary: true };

    return (
        <FullWidthContainer>
            {topLabel && (
                <SText.InputLabel {...getLabelProps()}>
                    {topLabel}
                </SText.InputLabel>
            )}
            <OTextInputContainer variant={variant}>
                <OTextInputStyled
                    variant={variant}
                    secureTextEntry={isPassword && !isSecureTextVisible}
                    placeholderTextColor="#999"
                    {...props}
                />
                {isPassword && (
                    <EyeIconButton onPress={toggleSecureEntry}>
                        <StyledMaterialIcon
                            name={
                                isSecureTextVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                            size={24}
                            color={
                                variant === "primary" ? Color.gray : Color.white
                            }
                        />
                    </EyeIconButton>
                )}
            </OTextInputContainer>

            {/* @BUG Fix error msg! */}
            {/*{bottomLabel && <SText.Error>{bottomLabel}</SText.Error>}*/}
        </FullWidthContainer>
    );
};
