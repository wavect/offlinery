import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { ROUTES } from "../routes";
import { DEFAULT_FROM_TIME, DEFAULT_TO_TIME, EACTION_USER, useUserContext } from "../../context/UserContext";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";

const ApproachMeBetween = ({ navigation }) => {
    const { state, dispatch } = useUserContext();

    const onFromTimeChange = (event: DateTimePickerEvent, date?: Date) => {
        dispatch({ type: EACTION_USER.SET_APPROACH_FROM_TIME, payload: date || DEFAULT_FROM_TIME });
    };
    const onToTimeChange = (event: DateTimePickerEvent, date?: Date) => {
        dispatch({ type: EACTION_USER.SET_APPROACH_TO_TIME, payload: date || DEFAULT_TO_TIME });
    };

    return (
        <OPageContainer
            title="Approach me between"
            subtitle="What are times you feel comfortable being approached at? Default is during the day."
            bottomContainerChildren={
                <OButtonWide
                    text="Continue"
                    filled={true}
                    variant="dark"
                    onPress={() => navigation.navigate(ROUTES.Main.HeatMap)}
                />
            }
        >
            <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>From</Text>
                <RNDateTimePicker
                    display="default"
                    mode="time"
                    onChange={onFromTimeChange}
                    accessibilityLabel="Approach me starting from"
                    value={state.approachFromTime}
                    style={styles.timePicker}
                />
            </View>

            <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>Until</Text>
                <RNDateTimePicker
                    display="default"
                    mode="time"
                    onChange={onToTimeChange}
                    accessibilityLabel="Approach me until"
                    value={state.approachToTime}
                    style={styles.timePicker}
                />
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
    },
    timePickerLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#333',
    },
    timePicker: {
        flex: 1,
    },
});

export default ApproachMeBetween;