import * as React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {useState} from "react";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import {i18n, TR} from "../../localization/translate.service";

const Password = ({route, navigation}) => {
    const {state, dispatch} = useUserContext()
    const [oldClearPassword, setOldClearPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordErrorConfirmation, setPasswordErrorConfirmation] = useState("")

    const isStrongPassword = () => {
        return state.clearPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,40}$/);
    }
    const doPasswordsMatch = (pwd: string) => {
        return state.clearPassword === pwd
    }

    const setValidatePassword = (pwd: string) => {
        dispatch({type: EACTION_USER.SET_CLEAR_PASSWORD, payload: pwd})

        if (isStrongPassword()) {
            setPasswordError('')
        } else {
            setPasswordError(i18n.t(TR.pwdErrSecurityGuideline))
        }
    }
    const setValidatePasswordConfirmation = (pwd: string) => {
        setPasswordConfirmation(pwd)

        if (doPasswordsMatch(pwd)) {
            setPasswordErrorConfirmation('')
        } else {
            setPasswordErrorConfirmation(i18n.t(TR.pwdErrNotMatching))
        }
    }

    const isValidPassword = () => {
        return isStrongPassword() && doPasswordsMatch(passwordConfirmation)
    }
    const isChangePassword = !!route?.params?.isChangePassword

    const onSave = () => {
        if (isChangePassword) {
            // TODO: Update User request to backend
            navigation.navigate(route.params.nextPage)
        } else {
            // Save later with the rest of the data
            navigation.navigate(ROUTES.Onboarding.FirstName)
        }
    }

    return <OPageContainer title={i18n.t(isChangePassword ? TR.changePassword : TR.setPassword)}
                           bottomContainerChildren={<OButtonWide text={isChangePassword ? i18n.t(TR.save) : i18n.t(TR.continue)} filled={true}
                                                                 disabled={!isValidPassword()} variant="dark"
                                                                 onPress={onSave}/>}
                           subtitle={i18n.t(TR.setStrongPassword)}>
        {isChangePassword && <OTextInput value={oldClearPassword} setValue={setOldClearPassword} placeholder={i18n.t(TR.enterOldPassword)} style={styles.inputField}
                    secureTextEntry={true}
                    topLabel={i18n.t(TR.currentPassword)}/>}

        <OTextInput value={state.clearPassword} setValue={setValidatePassword} placeholder={i18n.t(TR.enterPassword)} style={styles.inputField}
                    isBottomLabelError={!!passwordError} secureTextEntry={true} bottomLabel={passwordError}
                    topLabel={i18n.t(isChangePassword ? TR.newPassword : TR.strongPassword)}/>

        <OTextInput value={passwordConfirmation} setValue={setValidatePasswordConfirmation} placeholder={i18n.t(TR.repeatPassword)}
                    topLabel={i18n.t(TR.repeatPassword)} isBottomLabelError={!!passwordErrorConfirmation} secureTextEntry={true}
                    bottomLabel={passwordErrorConfirmation}
                    style={styles.inputField}/>
    </OPageContainer>
};

const styles = StyleSheet.create({
    inputField: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default Password;