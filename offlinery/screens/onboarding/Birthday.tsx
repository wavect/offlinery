import * as React from "react";
import {useState} from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import RNDateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";

const Birthday = ({navigation}) => {
    const { state, dispatch } = useUserContext()

    const setBirthDay = (event: DateTimePickerEvent, date?: Date) => {
        dispatch({ type: EACTION_USER.ADD_BIRTHDAY, payload: date || new Date(0)})
    }
    const isValidDate = () => {
        return true // todo, maybe just length check to avoid issues !isNaN(Date.parse(state.birthDay))
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={Title}>My birthday is</Text>
                <Text style={Subtitle}>
                    Your age will be public.
                </Text>

                <View style={styles.inputField}>
                    <RNDateTimePicker display="default" mode="date" onChange={setBirthDay} value={state.birthDay} />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <OButtonWide text="Continue" filled={true} disabled={isValidDate()} variant="dark"
                    onPress={() => navigation.navigate(ROUTES.Onboarding.ApproachChoice)}/>
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

export default Birthday;