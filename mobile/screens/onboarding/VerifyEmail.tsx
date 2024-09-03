import { RegistrationApi } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ROUTES } from "../routes";

const VerifyEmail = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [code, setCode] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isLoading, setLoading] = useState(false);

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
            inputs.current[index - 1].focus();
        }
    };

    const handleSubmit = async () => {
        const verificationCode = code.join("");

        const regApi = new RegistrationApi();
        await regApi.registrationControllerVerifyEmail({
            verifyEmailDTO: { email: state.email, verificationCode },
        });

        navigation.navigate(ROUTES.Onboarding.Password);
    };

    const sendVerificationCode = async () => {
        try {
            dispatch({
                type: EACTION_USER.SET_EMAIL_ERROR_MESSAGE,
                payload: "",
            });
            setLoading(true);
            const regApi = new RegistrationApi();
            const result =
                await regApi.registrationControllerRegisterUserForEmailVerification(
                    {
                        registrationForVerificationRequestDTO: {
                            email: state.email,
                        },
                    },
                );

            if (!result.email) {
                throw new Error("Error registering email");
            }

            const issuedAt = result.verificationCodeIssuedAt.getTime();
            const difference = Date.now() - issuedAt;
            const remainingTime =
                result.timeout / 1000 - Math.floor(difference / 1000);

            setTimer(remainingTime > 0 ? remainingTime : 0);
            setIsResendDisabled(remainingTime > 0);
        } catch (error) {
            console.error(error);
            dispatch({
                type: EACTION_USER.SET_EMAIL_ERROR_MESSAGE,
                payload: i18n.t(TR.invalidEmail),
            });
            navigation.goBack();
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
            title={i18n.t(TR.enterVerificationCode)}
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
                        style={styles.otpInput}
                        maxLength={1}
                        keyboardType="number-pad"
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        value={digit}
                    />
                ))}
            </View>
            <View style={styles.resendContainer}>
                <OButtonWide
                    text={
                        isResendDisabled
                            ? `${i18n.t(TR.verificationCodeResend)} (${formatTime(timer)})`
                            : i18n.t(TR.verificationCodeResend)
                    }
                    isLoading={isLoading}
                    disabled={isResendDisabled}
                    filled={true}
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
});

export default VerifyEmail;
