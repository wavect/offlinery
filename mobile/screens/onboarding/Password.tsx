import { MainStackParamList } from "@/MainStack.navigator";
import { UpdateUserPasswordDTO } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { ONewPasswordGroup } from "@/components/ONewPasswordGroup/ONewPasswordGroup";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import { isValidPassword } from "@/utils/validation-rules.utils";
import * as React from "react";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const Password = ({
    route,
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.Password
>) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);
    const [oldClearPassword, setOldClearPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordErrorConfirmation, setPasswordErrorConfirmation] =
        useState("");

    const doPasswordsMatch = (pwd: string) => {
        return state.clearPassword === pwd;
    };

    const setValidateOldPassword = (pwd: string) => {
        if (oldPasswordError) {
            setOldPasswordError("");
        }
        setOldClearPassword(pwd);
    };

    const setValidatePassword = (pwd: string) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { clearPassword: pwd },
        });

        if (isValidPassword(pwd)) {
            setPasswordError("");
        } else if (doPasswordsMatch(passwordConfirmation)) {
            setPasswordErrorConfirmation("");
        } else {
            setPasswordError(i18n.t(TR.pwdErrSecurityGuideline));
        }
    };
    const setValidatePasswordConfirmation = (pwd: string) => {
        setPasswordConfirmation(pwd);

        if (doPasswordsMatch(pwd)) {
            setPasswordErrorConfirmation("");
        } else {
            setPasswordErrorConfirmation(i18n.t(TR.pwdErrNotMatching));
        }
    };
    const isChangePassword = !!route?.params?.isChangePassword;

    const resetErrors = () => {
        setPasswordConfirmation("");
        setPasswordError("");
        setOldPasswordError("");
    };

    const onSave = async () => {
        resetErrors();
        if (isChangePassword) {
            setLoading(true);
            const updateUserPasswordDTO: UpdateUserPasswordDTO = {
                oldPassword: oldClearPassword,
                newPassword: state.clearPassword,
            };
            try {
                await API.user.userControllerUpdateUserPassword({
                    userId: state.id!,
                    updateUserPasswordDTO,
                });

                navigation.navigate(route.params.nextPage);
            } catch (err) {
                setOldPasswordError(i18n.t(TR.oldPasswordInvalid));
                throw err;
            } finally {
                setLoading(false);
            }
        } else {
            // Save later with the rest of the data
            navigation.navigate(ROUTES.Onboarding.FirstName);
        }
    };

    return (
        <OPageContainer
            fullpageIcon="lock"
            bottomContainerChildren={
                <OButtonWide
                    testID={TestData.settings.changePassword.confirm}
                    text={
                        isChangePassword ? i18n.t(TR.save) : i18n.t(TR.continue)
                    }
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.updating)}
                    filled={true}
                    disabled={
                        !isValidPassword(state.clearPassword) ||
                        !doPasswordsMatch(passwordConfirmation)
                    }
                    variant="dark"
                    onPress={onSave}
                />
            }
            subtitle={i18n.t(TR.setStrongPassword)}
        >
            {isChangePassword && (
                <OTextInput
                    testID={TestData.settings.changePassword.oldPw}
                    value={oldClearPassword}
                    onChangeText={setValidateOldPassword}
                    maxLength={100}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    inputMode="text"
                    autoCorrect={false}
                    keyboardType="default"
                    placeholder={i18n.t(TR.enterOldPassword)}
                    containerStyle={styles.inputField}
                    isSensitiveInformation={true}
                    bottomLabel={oldPasswordError}
                    isBottomLabelError={!!oldPasswordError}
                    topLabel={i18n.t(TR.currentPassword)}
                />
            )}
            <ONewPasswordGroup
                isChangePassword={isChangePassword}
                onPasswordChange={(
                    passwordError,
                    passwordErrorConfirmation,
                    passwordConfirmation,
                ) => setPasswordConfirmation(passwordConfirmation)}
            />
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    inputField: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        alignItems: "center",
    },
});

export default Password;
