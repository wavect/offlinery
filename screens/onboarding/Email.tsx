import * as React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {OCheckbox} from "../../components/OCheckbox/OCheckbox";

const Email = ({navigation}) => {
    const {state, dispatch} = useUserContext()

    const setEmail = (email: string) => {
        dispatch({type: EACTION_USER.SET_EMAIL, payload: email})
    }
    const setCheckboxChecked = (wantsEmailUpdates: boolean) => {
        dispatch({type: EACTION_USER.SET_EMAIL_UPDATES, payload: wantsEmailUpdates})
    }

    const isInvalidEmail = () => !state.email?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)

    return <OPageContainer title="What's your email?"
                           bottomContainerChildren={<OButtonWide text="Continue" filled={true}
                                                                 disabled={isInvalidEmail()} variant="dark"
                                                                 onPress={() => navigation.navigate(ROUTES.Onboarding.FirstName)}/>}
                           subtitle="Don't lose access to your account, verify your email.">
        <OTextInput value={state.email} setValue={setEmail} placeholder="Enter email" style={styles.inputField}/>

        <OCheckbox onValueChange={setCheckboxChecked} checkboxState={state.wantsEmailUpdates} label="I want to receive news, updates and offers from Offlinery."/>
    </OPageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 18,
    },
    content: {
        flex: 1,
    },
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

export default Email;