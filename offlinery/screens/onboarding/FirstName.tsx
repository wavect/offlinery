import * as React from "react";
import {useState} from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";

const FirstName = ({navigation}) => {
    const { state, dispatch } = useUserContext()

    const setFirstName = (firstName: string) => {
        dispatch({ type: EACTION_USER.ADD_FIRSTNAME, payload: firstName})
    }
    const isValidFirstName = () => {
        return state.firstName.length > 3
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={Title}>My first name is</Text>
                <Text style={Subtitle}>
                    This is how you will appear in Offlinery. You won't be able to change this.
                </Text>

                <View style={styles.inputField}>
                    <TextInput
                        style={styles.input}
                        value={state.firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <OButtonWide text="Continue" filled={true} disabled={!isValidFirstName()} variant="dark"
                    onPress={() => navigation.navigate(ROUTES.Onboarding.BirthDay)}/>
            </View>
        </View>
    );
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