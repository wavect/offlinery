import { Color, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import {
    EDateTimeFormatters,
    ODateTimePicker,
} from "@/components/ODateTimePicker/ODateTimePicker";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import {
    DEFAULT_FROM_TIME,
    DEFAULT_TO_TIME,
    EACTION_USER,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const ApproachMeBetween = ({
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.ApproachMeBetween
>) => {
    const { state, dispatch } = useUserContext();

    const onFromTimeChange = (event: DateTimePickerEvent, date?: Date) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { approachFromTime: date || DEFAULT_FROM_TIME },
        });
    };
    const onToTimeChange = (event: DateTimePickerEvent, date?: Date) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { approachToTime: date || DEFAULT_TO_TIME },
        });
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.approachMeBetweenDescr)}
            fullpageIcon="emoji-people"
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.BioLetThemKnow)
                    }
                />
            }
        >
            <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>{i18n.t(TR.from)}</Text>
                <ODateTimePicker
                    display="default"
                    mode="time"
                    onChange={onFromTimeChange}
                    accessibilityLabel={i18n.t(TR.fromDescr)}
                    value={state.approachFromTime}
                    style={styles.timePicker}
                    dateTimeFormatter={EDateTimeFormatters.TIME}
                    androidTextStyle={styles.timePickerAndroidText}
                />
            </View>

            <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>{i18n.t(TR.until)}</Text>
                <ODateTimePicker
                    display="default"
                    mode="time"
                    onChange={onToTimeChange}
                    accessibilityLabel={i18n.t(TR.untilDescr)}
                    value={state.approachToTime}
                    style={styles.timePicker}
                    dateTimeFormatter={EDateTimeFormatters.TIME}
                    androidTextStyle={styles.timePickerAndroidText}
                />
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 20,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        padding: 10,
    },
    timePickerLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
        color: "#333",
    },
    timePicker: {
        flex: 1,
    },
    timePickerAndroidText: {
        fontSize: FontSize.size_md,
        backgroundColor: Color.lighterGray,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginLeft: "auto",
    },
});

export default ApproachMeBetween;
