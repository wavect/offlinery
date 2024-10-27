import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import {
    EDateTimeFormatters,
    ODateTimePicker,
} from "@/components/ODateTimePicker/ODateTimePicker";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/services/storage.service";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const Birthday = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.BirthDay
>) => {
    const { state, dispatch } = useUserContext();

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    const onDatePickerEvent = (event: DateTimePickerEvent, date?: Date) => {
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
            fullpageIcon={Platform.OS === "android" ? "date-range" : undefined}
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
                <ODateTimePicker
                    display="inline"
                    mode="date"
                    onChange={onDatePickerEvent}
                    minimumDate={new Date(1900, 1, 1)}
                    maximumDate={getMinimumAge()}
                    value={state.birthDay}
                    timeZoneName="UTC"
                    dateTimeFormatter={EDateTimeFormatters.DATE}
                    androidTextStyle={styles.input}
                />
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
