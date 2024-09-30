import { Color, FontFamily } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { API } from "@/utils/api-config";
import { getLocalLanguageID, isNumericRegex } from "@/utils/misc.utils";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const VerifyEmail = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.VerifyEmail
>) => {
    const { state, dispatch } = useUserContext();
    const [code, setCode] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const inputs = React.useRef<TextInput[]>([]);

    const isInvalidCode = () =>
        code.some((digit) => digit === "" || digit === undefined);
    useEffect(() => {
        sendVerificationCode();
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

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];

        // Handle empty input (character deletion)
        if (text === "") {
            newCode[index] = "";
            setCode(newCode);
            return;
        }

        // Ignore non-numeric input (except empty string)
        if (!isNumericRegex.test(text)) {
            console.log("Non-numeric input detected. Ignoring.");
            return;
        }

        setErrorMessage("");

        // Handle pasted code (6 or more digits)
        if (text.length > 5) {
            console.log("Code: ", text);
            const splitted = text.split("").slice(0, 6);
            setCode(splitted);
            inputs.current[5].focus(); // Focus last input
            return;
        }

        // Handle single digit input
        if (text.length === 1) {
            newCode[index] = text;
            setCode(newCode);

            // Move focus to next input if not last
            if (index < 5) {
                inputs.current[index + 1].focus();
            }
            return;
        }

        // Handle multi-digit input in a single box
        // Extract the last digit entered
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

    const handleSubmit = async () => {
        const verificationCode = code.join("");

        try {
            await API.pendingUser.pendingUserControllerVerifyEmail({
                verifyEmailDTO: { email: state.email, verificationCode },
            });
            navigation.navigate(ROUTES.Onboarding.Password);
            setErrorMessage("");
        } catch (error) {
            console.error(error);
            setErrorMessage(i18n.t(TR.verificationCodeInvalid));
            setCode(new Array(6).fill("")); // reset code
            inputs.current[0].focus();
        }
    };

    const sendVerificationCode = async () => {
        try {
            setLoading(true);
            const result =
                await API.pendingUser.pendingUserControllerRegisterUserForEmailVerification(
                    {
                        registrationForVerificationRequestDTO: {
                            email: state.email,
                            language: getLocalLanguageID(),
                        },
                    },
                );

            if (result.registrationJWToken) {
                // @dev Registration specific jwt token, not valid for authenticating a user
                saveValueLocallySecurely(
                    SECURE_VALUE.JWT_ACCESS_TOKEN,
                    result.registrationJWToken,
                );
            }

            if (!result.email) {
                throw new Error("Error registering email");
            } else if (result.alreadyVerifiedButNotRegistered) {
                navigation.navigate(ROUTES.Onboarding.Password);
            }

            const issuedAt = result.verificationCodeIssuedAt.getTime();
            const difference = Date.now() - issuedAt;
            const remainingTime =
                result.timeout / 1000 - Math.floor(difference / 1000);

            setTimer(remainingTime > 0 ? remainingTime : 0);
            setIsResendDisabled(remainingTime > 0);
        } catch (error) {
            console.error(error);
            navigation.replace(ROUTES.Onboarding.Email, {
                errorMessage: i18n.t(TR.invalidEmailOrExists),
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    return (
        <OPageContainer
            fullpageIcon="mark-email-read"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.verify)}
                    filled={true}
                    disabled={isInvalidCode()}
                    variant="dark"
                    onPress={handleSubmit}
                />
            }
            subtitle={i18n.t(TR.verificationCodeSent)}
        >
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
            <View style={styles.resendContainer}>
                <OButtonWide
                    text={
                        isResendDisabled
                            ? `${i18n.t(TR.verificationCodeResend)} (${formatTime(timer)})`
                            : i18n.t(TR.verificationCodeResend)
                    }
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.verificationCodeLoadingBtnLbl)}
                    disabled={isResendDisabled}
                    filled={false}
                    variant="dark"
                    onPress={sendVerificationCode}
                ></OButtonWide>
            </View>
        </OPageContainer>
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

export default VerifyEmail;
