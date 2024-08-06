import * as React from "react";
import {StyleSheet, TextInput, View} from "react-native";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {i18n, TR} from "../../localization/translate.service";

const FirstName = ({navigation}) => {
    const { state, dispatch } = useUserContext()

    const setFirstName = (firstName: string) => {
        dispatch({ type: EACTION_USER.SET_FIRSTNAME, payload: firstName})
    }
    const isValidFirstName = () => {
        return state.firstName.length > 3
    }

    return <OPageContainer title={i18n.t(TR.myFirstNameIs)} bottomContainerChildren={
            <OButtonWide text={i18n.t(TR.continue)} filled={true} disabled={!isValidFirstName()} variant="dark"
                         onPress={() => navigation.navigate(ROUTES.Onboarding.BirthDay)}/>
        } subtitle={i18n.t(TR.myFirstNameDescr)}>
            <View style={styles.inputField}>
                <TextInput
                    style={styles.input}
                    value={state.firstName}
                    onChangeText={setFirstName}
                    placeholder={i18n.t(TR.enterFirstName)}
                    placeholderTextColor="#999"
                />
            </View>
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
    checkboxField: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 10,
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default FirstName;