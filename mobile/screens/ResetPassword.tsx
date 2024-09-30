import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { ONewPasswordGroup } from "@/components/ONewPasswordGroup/ONewPasswordGroup";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OSplitInput } from "@/components/OSplitInput/OSplitInput";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { API } from "@/utils/api-config";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const ResetPassword = ({
    navigation,
}: NativeStackScreenProps<MainStackParamList, typeof ROUTES.ResetPassword>) => {
    const { state } = useUserContext();
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [isPwdValid, setIsPwdValid] = useState(false);
    const codeRef = useRef<string>("");

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
            subtitle={i18n.t(TR.verificationCodeSent)}
        >
            <OSplitInput
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
});
