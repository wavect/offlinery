import * as React from "react";
import {useState} from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, useUserContext} from "../../context/UserContext";
import RNDateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";

const Birthday = ({navigation}) => {
    const {state, dispatch} = useUserContext()
    const [showDatePicker, setShowDatePicker] = useState(false)

    const onDatePickerEvent = (event: DateTimePickerEvent, date?: Date) => {
        setShowDatePicker(!showDatePicker)
        dispatch({type: EACTION_USER.SET_BIRTHDAY, payload: date || new Date()})
    }

    return <OPageContainer title="My birthday is" subtitle="Your age will be public"
                           bottomContainerChildren={<OButtonWide text="Continue" filled={true} variant="dark"
                                                                 onPress={() => navigation.navigate(ROUTES.Onboarding.GenderChoice)}/>}>
        <View style={styles.inputField}>
            <TextInput
                style={styles.input}
                showSoftInputOnFocus={false}
                value={state.birthDay.toLocaleDateString()}
                onPress={() => setShowDatePicker(true)}
                placeholder="01.01.2000"
                placeholderTextColor="#999"
            />
            {showDatePicker && <RNDateTimePicker display="inline" mode="date" onChange={onDatePickerEvent}
                                                 minimumDate={new Date(1900, 1, 1)}
                                                 maximumDate={new Date(2010, 1, 1)}
                                                 value={state.birthDay}/>}
        </View>
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
});

export default Birthday;