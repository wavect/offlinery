import { Color, FontFamily } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { API } from "@/utils/api-config";
import { getLocalLanguageID } from "@/utils/misc.utils";
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

    const isInvalidCode = () => code.some((digit) => digit === "");

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
        setErrorMessage("");
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text.length === 1 && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        if (
            event.nativeEvent.key === "Backspace" &&
            index > 0 &&
            code[index] === ""
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

            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { registrationJWToken: result.registrationJWToken },
            });
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
            navigation.navigate(ROUTES.Onboarding.Email, {
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
                        maxLength={1}
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
