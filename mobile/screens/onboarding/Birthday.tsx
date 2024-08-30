import RNDateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "../../context/UserContext";
import { i18n, TR } from "../../localization/translate.service";
import { ROUTES } from "../routes";

const Birthday = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDatePickerEvent = (event: DateTimePickerEvent, date?: Date) => {
        setShowDatePicker(!showDatePicker);
        dispatch({
            type: EACTION_USER.SET_BIRTHDAY,
            payload: date || new Date(2000, 1, 1),
        });
    };

    return (
        <OPageContainer
            title={i18n.t(TR.myBirthDayIs)}
            subtitle={i18n.t(TR.yourAgeWillBePublic)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.GenderChoice)
                    }
                />
            }
        >
            <View style={styles.inputField}>
                <TextInput
                    style={styles.input}
                    showSoftInputOnFocus={false}
                    value={state.birthDay.toLocaleDateString()}
                    onPress={() => setShowDatePicker(true)}
                    placeholder="01.01.2000"
                    placeholderTextColor="#999"
                />
                {showDatePicker && (
                    <RNDateTimePicker
                        display="inline"
                        mode="date"
                        onChange={onDatePickerEvent}
                        minimumDate={new Date(1900, 1, 1)}
                        maximumDate={new Date(2010, 1, 1)}
                        value={state.birthDay}
                    />
                )}
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    inputField: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
});

export default Birthday;
