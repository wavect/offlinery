import { Color, FontFamily } from "@/GlobalStyles";
import { EmailCodeResponseADTO } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { TR, i18n } from "@/localization/translate.service";
import { isNumericRegex } from "@/utils/misc.utils";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface OSplitInputProps {
    sendCode: () => Promise<EmailCodeResponseADTO>;
    onError?: () => Promise<void>;
    onCodeValidChange: (isValid: boolean, code: string) => void;
}

export const OSplitInput = (props: OSplitInputProps) => {
    const { onError, onCodeValidChange, sendCode } = props;
    const [code, setCode] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const inputs = React.useRef<TextInput[]>([]);

    const isValidCode = () =>
        code.every((digit) => digit !== "" && digit !== undefined);

    const sendEmailCode = async () => {
        try {
            setLoading(true);
            const result: EmailCodeResponseADTO = await sendCode();
            const issuedAt = result.codeIssuedAt.getTime();
            const difference = Date.now() - issuedAt;
            const remainingTime =
                result.timeout / 1000 - Math.floor(difference / 1000);
            setTimer(remainingTime > 0 ? remainingTime : 0);
            setIsResendDisabled(remainingTime > 0);
        } catch (error) {
            console.error(error);
            if (onError) {
                await onError();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        sendEmailCode();
    }, []);

    useEffect(() => {
        if (timer > 0) {
            setIsResendDisabled(true);
            const countdown = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);

            return () => clearInterval(countdown);
        } else {
            setIsResendDisabled(false);
        }
    }, [timer]);

    useEffect(() => {
        const isValid = isValidCode();
        onCodeValidChange(isValid, code.join(""));
    }, [code]);

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];

        if (text === "") {
            newCode[index] = "";
            setCode(newCode);
            return;
        }

        if (!isNumericRegex.test(text)) {
            console.log("Non-numeric input detected. Ignoring.");
            return;
        }

        setErrorMessage("");

        if (text.length > 5) {
            console.log("Code: ", text);
            const splitted = text.split("").slice(0, 6);
            setCode(splitted);
            inputs.current[5].focus();
            return;
        }

        if (text.length === 1) {
            newCode[index] = text;
            setCode(newCode);

            if (index < 5) {
                inputs.current[index + 1].focus();
            }
            return;
        }

        newCode[index] = text.charAt(text.length - 1);
        setCode(newCode);
    };

    const handleKeyPress = (event: any, index: number) => {
        if (
            event.nativeEvent.key === "Backspace" &&
            index > 0 &&
            (code[index] === "" || code[index] === undefined)
        ) {
            const newCode = [...code];
            newCode[index - 1] = "";
            setCode(newCode);
            inputs.current[index - 1].focus();
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    return (
        <>
            <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) =>
                            (inputs.current[index] = ref as TextInput)
                        }
                        autoCapitalize="none"
                        autoComplete="off"
                        inputMode="numeric"
                        autoCorrect={false}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        value={digit}
                    />
                ))}
            </View>
            {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
            {isValidCode() ? null : (
                <View style={styles.resendContainer}>
                    <OButtonWide
                        text={
                            isResendDisabled
                                ? `${i18n.t(TR.verificationCodeResend)} (${formatTime(timer)})`
                                : i18n.t(TR.verificationCodeResend)
                        }
                        isLoading={isLoading}
                        loadingBtnText={i18n.t(
                            TR.verificationCodeLoadingBtnLbl,
                        )}
                        disabled={isResendDisabled}
                        filled={false}
                        variant="dark"
                        onPress={sendEmailCode}
                    />
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    otpInput: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        textAlign: "center",
        fontSize: 20,
    },
    resendContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    errorMessage: {
        color: Color.redLight,
        fontSize: 16,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "center",
        marginBottom: 10,
    },
});
