import * as React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {useState} from "react";
import {EACTION_USER, useUserContext} from "../../context/UserContext";

const Password = ({route, navigation}) => {
    const {state, dispatch} = useUserContext()
    const [oldClearPassword, setOldClearPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordErrorConfirmation, setPasswordErrorConfirmation] = useState("")

    const isStrongPassword = () => {
        return state.clearPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,40}$/);
    }
    const doPasswordsMatch = () => {
        return state.clearPassword === passwordConfirmation
    }

    const setValidatePassword = (pwd: string) => {
        dispatch({type: EACTION_USER.SET_CLEAR_PASSWORD, payload: pwd})

        if (isStrongPassword()) {
            setPasswordError('')
        } else {
            setPasswordError('Password must contain at least 1 number, 1 big and small letter and have between 6-40 characters.')
        }
    }
    const setValidatePasswordConfirmation = (pwd: string) => {
        setPasswordConfirmation(pwd)

        if (doPasswordsMatch()) {
            setPasswordErrorConfirmation('')
        } else {
            setPasswordErrorConfirmation('Passwords do not match.')
        }
    }

    const isValidPassword = () => {
        return isStrongPassword() && doPasswordsMatch()
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

    return <OPageContainer title={`${isChangePassword ? 'Change' : 'Set'} password`}
                           bottomContainerChildren={<OButtonWide text={isChangePassword ? 'Save' : 'Continue'} filled={true}
                                                                 disabled={!isValidPassword()} variant="dark"
                                                                 onPress={onSave}/>}
                           subtitle="Set a strong password.">
        {isChangePassword && <OTextInput value={oldClearPassword} setValue={setOldClearPassword} placeholder="Enter old password" style={styles.inputField}
                    secureTextEntry={true}
                    topLabel="Current password"/>}

        <OTextInput value={state.clearPassword} setValue={setValidatePassword} placeholder="Enter password" style={styles.inputField}
                    isBottomLabelError={!!passwordError} secureTextEntry={true} bottomLabel={passwordError}
                    topLabel={`${isChangePassword ? 'New' : 'Strong'} password`}/>

        <OTextInput value={passwordConfirmation} setValue={setValidatePasswordConfirmation} placeholder="Repeat password"
                    topLabel="Repeat password" isBottomLabelError={!!passwordErrorConfirmation} secureTextEntry={true}
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