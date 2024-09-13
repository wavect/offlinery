import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import RNDateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as React from "react";
import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const Birthday = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.BirthDay
>) => {
    const { state, dispatch } = useUserContext();
    const isIOS = Platform.OS === "ios";
    // Android is a date dialog, while on iOS it kind of is embedded on the screen and still is usable if shown consistently
    const [showDatePicker, setShowDatePicker] = useState(isIOS);

    const onDatePickerEvent = (event: DateTimePickerEvent, date?: Date) => {
        if (!isIOS) {
            setShowDatePicker(!showDatePicker);
        }
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { birthDay: date || new Date(2000, 1, 1) },
        });
    };

    const getMinimumAge = () => {
        const today = new Date();
        return new Date(
            today.getFullYear() - 14,
            today.getMonth(),
            today.getDate(),
        );
    };

    return (
        <OPageContainer
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
                    value={state.birthDay.toLocaleDateString(undefined, {
                        timeZone: "utc",
                    })}
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
                        maximumDate={getMinimumAge()}
                        value={state.birthDay}
                        timeZoneName="UTC"
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
