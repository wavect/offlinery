import { StyledMaterialIcon } from "@/styles/Icon.styles";
import {
    EyeIconButton,
    OTextInputBottomLabel,
    OTextInputContainer,
    OTextInputStyled,
} from "@/styles/Input.styles";
import { StyledText } from "@/styles/Text.styles";
import { Container } from "@/styles/View.styles";
import React, { useState } from "react";
import { TextInputProps } from "react-native";

interface IOTextInputProps extends Omit<TextInputProps, "secureTextEntry"> {
    topLabel?: string;
    bottomLabel?: string;
    isBottomLabelError?: boolean;
    isSensitiveInformation?: boolean;
}

export const OTextInput: React.FC<IOTextInputProps> = ({
    topLabel,
    bottomLabel,
    isBottomLabelError,
    isSensitiveInformation,
    ...props
}) => {
    const [isSecureTextVisible, setIsSecureTextVisible] = useState(
        !isSensitiveInformation,
    );

    const toggleSecureEntry = () => {
        setIsSecureTextVisible(!isSecureTextVisible);
    };

    return (
        <Container>
            {topLabel && (
                <StyledText.InputLabel>{topLabel}</StyledText.InputLabel>
            )}
            <OTextInputContainer>
                <OTextInputStyled
                    secureTextEntry={
                        isSensitiveInformation && !isSecureTextVisible
                    }
                    placeholderTextColor="#999"
                    {...props}
                />
                {isSensitiveInformation && (
                    <EyeIconButton onPress={toggleSecureEntry}>
                        <StyledMaterialIcon
                            name={
                                isSecureTextVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                            size={24}
                            color="#999"
                        />
                    </EyeIconButton>
                )}
            </OTextInputContainer>
            {bottomLabel && (
                <OTextInputBottomLabel isError={isBottomLabelError}>
                    {bottomLabel}
                </OTextInputBottomLabel>
            )}
        </Container>
    );
};
