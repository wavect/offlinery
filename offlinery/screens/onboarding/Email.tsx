import * as React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";

const Email = ({navigation}) => {
    const { state, dispatch } = useUserContext()

    const setEmail = (email: string) => {
        dispatch({ type: EACTION_USER.ADD_EMAIL, payload: email})
    }
    const setCheckboxChecked = (wantsEmailUpdates: boolean) => {
        dispatch({ type: EACTION_USER.SET_EMAIL_UPDATES, payload: wantsEmailUpdates })
    }

    const isInvalidEmail = () => !state.email?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={Title}>What's your email?</Text>
                <Text style={Subtitle}>
                    Don't lose access to your account, verify your email.
                </Text>

                <View style={styles.inputField}>
                    <TextInput
                        style={styles.input}
                        value={state.email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.checkboxField}>
                    <Checkbox value={state.wantsEmailUpdates} onValueChange={setCheckboxChecked} />
                    <Text style={styles.checkboxLabel}>
                        I want to receive news, updates and offers from Offlinery.
                    </Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <OButtonWide text="Continue" filled={true} disabled={isInvalidEmail()} variant="dark"
                             onPress={() => navigation.navigate(ROUTES.Onboarding.FirstName)}/>
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

export default Email;