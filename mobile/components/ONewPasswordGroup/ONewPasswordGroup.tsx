import { OTextInput } from "@/components/OTextInput/OTextInput";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { TestData } from "@/tests/src/accessors";
import { isValidPassword } from "@/utils/validation-rules.utils";
import * as React from "react";
import { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface ONewPasswordGroupProps {
    /** @dev Changing password or creating new one? */
    isChangePassword: boolean;
    onPasswordChange?: (
        passwordError: string,
        passwordErrorConfirmation: string,
        passwordConfirmation: string,
    ) => void;
    containerStyle?: StyleProp<ViewStyle>;
}

export const ONewPasswordGroup = (props: ONewPasswordGroupProps) => {
    const { isChangePassword, containerStyle, onPasswordChange } = props;
    const { dispatch, state } = useUserContext();
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

    useEffect(() => {
        if (onPasswordChange) {
            onPasswordChange(
                passwordError,
                passwordErrorConfirmation,
                passwordConfirmation,
            );
        }
    }, [
        onPasswordChange,
        passwordError,
        passwordErrorConfirmation,
        passwordConfirmation,
    ]);

    return (
        <View style={containerStyle}>
            <OTextInput
                testID={TestData.settings.changePassword.newPw}
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
                testID={TestData.settings.changePassword.newPwRpt}
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
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputField: {
        marginBottom: 24,
        width: "100%",
    },
});
