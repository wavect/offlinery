import * as React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {OCheckbox} from "../../components/OCheckbox/OCheckbox";
import {useState} from "react";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";

const Password = ({navigation}) => {

    // NOTE: Do not store password in global store, hash & salt on backend and verify on backend
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordErrorConfirmation, setPasswordErrorConfirmation] = useState("")

    const isStrongPassword = () => {
        return password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,40}$/);
    }
    const doPasswordsMatch = () => {
        return password === passwordConfirmation
    }

    const setValidatePassword = (pwd: string) => {
        setPassword(pwd)

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

    return <OPageContainer title="Set password"
                           bottomContainerChildren={<OButtonWide text="Continue" filled={true}
                                                                 disabled={!isValidPassword()} variant="dark"
                                                                 onPress={() => navigation.navigate(ROUTES.Onboarding.FirstName)}/>}
                           subtitle="Set a strong password.">
        <OTextInput value={password} setValue={setValidatePassword} placeholder="Enter password" style={styles.inputField}
                    isBottomLabelError={!!passwordError} secureTextEntry={true} bottomLabel={passwordError}
                    topLabel="Strong password"/>

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