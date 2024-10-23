import { MainStackParamList } from "@/MainStack.navigator";
import { PendingUserApi } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import OErrorMessage from "@/components/OErrorMessage.tsx/OErrorMessage";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OSplitInput } from "@/components/OSplitInput/OSplitInput";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { getLocalLanguageID } from "@/utils/misc.utils";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const VerifyEmail = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.VerifyEmail
>) => {
    const { state, dispatch } = useUserContext();
    const [isCodeValid, setIsCodeValid] = useState(false);
    const codeRef = useRef<string>("");
    const api = new PendingUserApi();

    const verifyCode = async (verificationCode: string) => {
        try {
            await api.pendingUserControllerVerifyEmail({
                verifyEmailDTO: { email: state.email, verificationCode },
            });
            navigation.navigate(ROUTES.Onboarding.Password);
            return true;
        } catch (error) {
            return false;
        }
    };

    const sendVerificationCode = async () => {
        const result =
            await api.pendingUserControllerRegisterUserForEmailVerification({
                registrationForVerificationRequestDTO: {
                    email: state.email,
                    language: getLocalLanguageID(),
                    wantsEmailUpdates: state.wantsEmailUpdates,
                },
            });

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
            navigation.replace(ROUTES.Onboarding.Password);
        }
        return result;
    };

    const onError = async () => {
        setIsCodeValid(false);
    };

    const handleSubmit = async () => {
        if (isCodeValid) {
            const success = await verifyCode(codeRef.current);
            if (success) {
                navigation.replace(ROUTES.Onboarding.Password);
            } else {
                // Handle verification failure
                setIsCodeValid(false);
            }
        }
    };

    return (
        <OPageContainer
            fullpageIcon="mark-email-read"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.verify)}
                    filled={true}
                    disabled={!isCodeValid}
                    variant="dark"
                    onPress={handleSubmit}
                />
            }
            subtitle={i18n.t(TR.verificationCodeSent)}
        >
            <OSplitInput
                sendCodeAutomatically={true}
                sendCode={sendVerificationCode}
                onError={onError}
                onCodeValidChange={(isValid, code) => {
                    setIsCodeValid(isValid);
                    codeRef.current = code;
                }}
            />
            <OErrorMessage
                style={styles.errorMsg}
                errorMessage={i18n.t(TR.verificationCodeInvalid)}
                show={!isCodeValid && codeRef.current.length === 6}
            />
            <OErrorMessage
                style={styles.errorMsg}
                errorMessage={i18n.t(TR.invalidEmailOrExists)}
                show={!isCodeValid && codeRef.current.length === 0}
            />
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    errorMsg: {
        alignSelf: "center",
        marginTop: 6,
    },
});

export default VerifyEmail;
