import { Color } from "@/GlobalStyles";
import { IOButtonSmallProps } from "@/interfaces/button.interface";
import {
    ButtonBase,
    ButtonText,
    ContentContainer,
    IOButtonSmallVariant,
    StyledActivityIndicator,
} from "@/styles/Button.styles";
import React, { useState } from "react";

export const OButtonSmall: React.FC<IOButtonSmallProps> = ({
    onPress,
    label,
    isDisabled = false,
    variant = IOButtonSmallVariant.Black,
    fullWidth = false,
}) => {
    const [isLoading, setLoading] = useState(false);

    const wrappedOnPress = async () => {
        setLoading(true);
        try {
            await onPress();
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <ButtonBase
            variant={variant}
            isDisabled={isDisabled}
            fullWidth={fullWidth}
            onPress={wrappedOnPress}
            disabled={isDisabled || isLoading}
        >
            <ContentContainer>
                {isLoading && (
                    <StyledActivityIndicator size="small" color={Color.white} />
                )}
                <ButtonText>{label}</ButtonText>
            </ContentContainer>
        </ButtonBase>
    );
};
