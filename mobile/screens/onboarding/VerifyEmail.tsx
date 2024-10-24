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
import { getLocalLanguageID, saveOnboardingState } from "@/utils/misc.utils";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const VerifyEmail = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.VerifyEmail
>) => {
    const { state } = useUserContext();
    const [isCodeValid, setIsCodeValid] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            code: "",
        },
    });

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

    const onSubmit = async () => {
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

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    return (
        <OPageContainer
            fullpageIcon="mark-email-read"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.verify)}
                    filled={true}
                    disabled={!isCodeValid}
                    variant="dark"
                    onPress={handleSubmit(onSubmit)}
                />
            }
            subtitle={i18n.t(TR.verificationCodeSent)}
        >
            <Controller
                control={control}
                name="code"
                rules={{
                    validate: () => isCodeValid,
                }}
                render={({ field: { onChange } }) => (
                    <OSplitInput
                        sendCodeAutomatically={true}
                        sendCode={sendVerificationCode}
                        onError={onError}
                        onCodeValidChange={(isValid, code) => {
                            setIsCodeValid(isValid);
                            onChange(code);
                            codeRef.current = code;
                        }}
                    />
                )}
            />

            <OErrorMessage
                style={styles.errorMsg}
                errorMessage={i18n.t(TR.verificationCodeInvalid)}
                show={!isCodeValid && codeRef.current.length === 6}
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
