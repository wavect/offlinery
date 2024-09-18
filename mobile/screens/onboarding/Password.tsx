import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
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
    const [oldClearPassword, setOldClearPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordErrorConfirmation, setPasswordErrorConfirmation] =
        useState("");

    const doPasswordsMatch = (pwd: string) => {
        return state.clearPassword === pwd;
    };

    const setValidatePassword = (pwd: string) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { clearPassword: pwd },
        });

        if (isValidPassword(state.clearPassword)) {
            setPasswordError("");
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

    const onSave = () => {
        if (isChangePassword) {
            // TODO: Update User request to backend
            navigation.navigate(route.params.nextPage);
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
                    text={
                        isChangePassword ? i18n.t(TR.save) : i18n.t(TR.continue)
                    }
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
                    value={oldClearPassword}
                    onChangeText={setOldClearPassword}
                    maxLength={100}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    inputMode="text"
                    autoCorrect={false}
                    keyboardType="default"
                    placeholder={i18n.t(TR.enterOldPassword)}
                    containerStyle={styles.inputField}
                    isSensitiveInformation={true}
                    topLabel={i18n.t(TR.currentPassword)}
                />
            )}

            <OTextInput
                value={state.clearPassword}
                onChangeText={setValidatePassword}
                maxLength={100}
                autoCapitalize="none"
                autoComplete="new-password"
                inputMode="text"
                autoCorrect={false}
                keyboardType="default"
                placeholder={i18n.t(TR.enterPassword)}
                containerStyle={styles.inputField}
                isBottomLabelError={!!passwordError}
                isSensitiveInformation={true}
                bottomLabel={passwordError}
                topLabel={i18n.t(
                    isChangePassword ? TR.newPassword : TR.strongPassword,
                )}
            />

            <OTextInput
                value={passwordConfirmation}
                onChangeText={setValidatePasswordConfirmation}
                maxLength={100}
                autoCapitalize="none"
                autoComplete="new-password"
                inputMode="text"
                autoCorrect={false}
                keyboardType="default"
                placeholder={i18n.t(TR.repeatPassword)}
                topLabel={i18n.t(TR.repeatPassword)}
                isBottomLabelError={!!passwordErrorConfirmation}
                isSensitiveInformation={true}
                bottomLabel={passwordErrorConfirmation}
                containerStyle={styles.inputField}
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
