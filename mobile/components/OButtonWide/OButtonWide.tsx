import {
    IOButtonWideProps,
    OButtonWideBase,
    OButtonWideText,
    StyledActivityIndicator,
} from "@/styles/Button.styles";
import React, { useEffect, useState } from "react";

export const OButtonWide: React.FC<IOButtonWideProps> = ({
    loadingBtnText,
    isLoading,
    text,
    filled,
    variant,
    onPress,
    size = "default",
    disabled = false,
    countdownEnableSeconds = 0,
}) => {
    const [countdown, setCountdown] = useState(countdownEnableSeconds);
    const [isBtnCountdownActive, setIsBtnCountdownActive] = useState(
        countdownEnableSeconds > 0,
    );

    useEffect(() => {
        if (countdown > 0) {
            const timer: NodeJS.Timeout = setInterval(() => {
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
        <OButtonWideBase
            onPress={onPress}
            disabled={isDisabled}
            filled={filled}
            variant={variant}
        >
            <OButtonWideText
                filled={filled}
                variant={variant}
                disabled={isDisabled}
                size={size}
            >
                {isLoading ? (
                    <>
                        <StyledActivityIndicator size="small" />
                        {(loadingBtnText || buttonText).toUpperCase()}
                    </>
                ) : (
                    buttonText.toUpperCase()
                )}
            </OButtonWideText>
        </OButtonWideBase>
    );
};
