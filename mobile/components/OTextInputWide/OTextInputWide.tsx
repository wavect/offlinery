import { Color } from "@/GlobalStyles";
import { StyledMaterialIcon } from "@/styles/Icon.styles";
import {
    EyeIconButton,
    OTextInputWideBottomLabel,
    OTextInputWideContainer,
    OTextInputWideStyled,
    OTextInputWideTopLabel,
} from "@/styles/Input.styles";
import { Container } from "@/styles/View.styles";
import React, { useState } from "react";
import { TextInputProps } from "react-native";

interface IOTextInputWideProps extends TextInputProps {
    topLabel?: string;
    bottomLabel?: string;
    isBottomLabelError?: boolean;
}

export const OTextInputWide: React.FC<IOTextInputWideProps> = ({
    secureTextEntry,
    isBottomLabelError,
    topLabel,
    bottomLabel,
    ...props
}) => {
    const [isSecureTextVisible, setIsSecureTextVisible] =
        useState(!secureTextEntry);

    const toggleSecureEntry = () => {
        setIsSecureTextVisible(!isSecureTextVisible);
    };

    return (
        <Container>
            {topLabel && (
                <OTextInputWideTopLabel>{topLabel}</OTextInputWideTopLabel>
            )}
            <OTextInputWideContainer>
                <OTextInputWideStyled
                    secureTextEntry={secureTextEntry && !isSecureTextVisible}
                    placeholderTextColor={Color.white}
                    {...props}
                />
                {secureTextEntry && (
                    <EyeIconButton onPress={toggleSecureEntry}>
                        <StyledMaterialIcon
                            name={
                                isSecureTextVisible
                                    ? "visibility"
                                    : "visibility-off"
                            }
                        />
                    </EyeIconButton>
                )}
            </OTextInputWideContainer>
            {bottomLabel && (
                <OTextInputWideBottomLabel isError={isBottomLabelError}>
                    {bottomLabel}
                </OTextInputWideBottomLabel>
            )}
        </Container>
    );
};
