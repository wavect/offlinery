import { Color, FontFamily } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import OErrorMessage from "@/components/OErrorMessage.tsx/OErrorMessage";
import { ONewPasswordGroup } from "@/components/ONewPasswordGroup/ONewPasswordGroup";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OSplitInput } from "@/components/OSplitInput/OSplitInput";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { API } from "@/utils/api-config";
import { isValidEmail } from "@/utils/validation-rules.utils";
import React, { useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const ResetPassword = ({
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.ResetPassword>) => {
    const { state, dispatch } = useUserContext();
    const [errorMessage, setErrorMessage] = React.useState("");
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [isPwdValid, setIsPwdValid] = useState(false);
    const [email, setEmail] = useState(state.email);
    const codeRef = useRef<string>("");

    const setUserContextEmail = (email: string) => {
        setErrorMessage(isValidEmail(email) ? "" : i18n.t(TR.invalidEmail));
        setEmail(email);
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { email } });
    };

    const verifyCode = async (verificationCode: string) => {
        try {
            await API.user.userControllerResetPassword({
                verifyResetPasswordDTO: {
                    email: state.email,
                    verificationCode,
                    newClearPassword: state.clearPassword,
                },
            });
            navigation.navigate(ROUTES.Login);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const sendVerificationCode = async () => {
        const result =
            await API.user.userControllerRequestPasswordChangeAsForgotten({
                resetPasswordRequestDTO: {
                    email: state.email,
                },
            });
        if (!result.email) {
            throw new Error("User does not exist or unknown error.");
        }
        return result;
    };

    const handleSubmit = async () => {
        if (isCodeValid) {
            const success = await verifyCode(codeRef.current);
            if (success) {
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: { clearPassword: "" },
                });
                navigation.replace(ROUTES.Login);
            } else {
                // Handle verification failure
                setIsCodeValid(false);
            }
        }
    };

    const setPasswordValidStatus = (
        passwordError: string,
        passwordErrorConfirmation: string,
        passwordConfirmation: string,
    ) => {
        const isValid = !(
            passwordError ||
            passwordErrorConfirmation ||
            !state.clearPassword ||
            !passwordConfirmation
        );
        setIsPwdValid(isValid);
    };

    return (
        <OPageContainer
            fullpageIcon="password"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.verify)}
                    filled={true}
                    disabled={!isCodeValid || !isPwdValid}
                    variant="dark"
                    onPress={handleSubmit}
                />
            }
        >
            <OTextInput
                value={state.email}
                onChangeText={(email: string) =>
                    setUserContextEmail(email.trim())
                }
                maxLength={125}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                autoCorrect={false}
                inputMode="email"
                placeholder={i18n.t(TR.yourEmail)}
                containerStyle={[
                    styles.inputField,
                    errorMessage ? { marginBottom: 6 } : undefined,
                ]}
            />
            <OErrorMessage
                style={styles.errorMessage}
                errorMessage={errorMessage}
                show={errorMessage !== undefined}
            />

            <Text style={styles.sixDigitCodeExplainer}>
                {i18n.t(TR.verificationCodeSent)}
            </Text>
            <OSplitInput
                disableRequestCode={!isValidEmail(email)}
                sendCodeAutomatically={false}
                sendCode={sendVerificationCode}
                onCodeValidChange={(isValid, code) => {
                    setIsCodeValid(isValid);
                    codeRef.current = code;
                }}
            />

            {isCodeValid ? (
                <ONewPasswordGroup
                    isChangePassword={true}
                    onPasswordChange={setPasswordValidStatus}
                    containerStyle={styles.passwordGroup}
                />
            ) : null}
        </OPageContainer>
    );
};

export default ResetPassword;

const styles = StyleSheet.create({
    passwordGroup: {
        marginTop: 20,
    },
    inputField: {
        marginBottom: 24,
        width: "100%",
    },
    errorMessage: {
        color: Color.redLight,
        fontSize: 16,
        fontFamily: FontFamily.montserratSemiBold,
        textAlign: "left",
        marginBottom: 16,
    },
    sixDigitCodeExplainer: {
        fontSize: 16,
        color: Color.gray,
        marginTop: 4,
        marginBottom: 16,
    },
});
