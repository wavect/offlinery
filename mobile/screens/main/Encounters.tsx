import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import {
    EDateTimeFormatters,
    ODateTimePicker,
} from "@/components/ODateTimePicker/ODateTimePicker";
import { OEncounterList } from "@/components/OEncounterList/OEncounterList";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { TR, i18n } from "@/localization/translate.service";
import { MainScreenTabsParamList } from "@/screens/main/MainScreenTabs.navigator";
import { ROUTES } from "@/screens/routes";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const Encounters = ({
    navigation,
}: BottomTabScreenProps<
    MainScreenTabsParamList,
    typeof ROUTES.MainTabView
>) => {
    const today = new Date();
    const threeMonthsBefore = new Date();
    threeMonthsBefore.setDate(today.getDate() - 90);
    const [metStartDateFilter, setMetStartDateFilter] =
        useState<Date>(threeMonthsBefore);
    const [metEndDateFilter, setMetEndDateFilter] = useState<Date>(today);

    const onMetStartDateFilterChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setMetStartDateFilter(selectedDate);
        }
    };

    const onMetEndDateFilterChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setMetEndDateFilter(selectedDate);
        }
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.peopleYouMightHaveMet)}
            doNotUseScrollView={true}
        >
            <View style={styles.container}>
                <View style={styles.dateRangeContainer}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>From</Text>
                        <ODateTimePicker
                            display="default"
                            mode="date"
                            style={styles.iosDatePicker}
                            onChange={onMetStartDateFilterChange}
                            accessibilityLabel={i18n.t(TR.weMetFrom)}
                            value={metStartDateFilter}
                            dateTimeFormatter={EDateTimeFormatters.DATE}
                            androidTextStyle={styles.androidDateButton}
                            maximumDate={metEndDateFilter}
                        />
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>To</Text>
                        <ODateTimePicker
                            display="default"
                            mode="date"
                            style={styles.iosDatePicker}
                            onChange={onMetEndDateFilterChange}
                            accessibilityLabel={i18n.t(TR.toThisDate)}
                            value={metEndDateFilter}
                            dateTimeFormatter={EDateTimeFormatters.DATE}
                            androidTextStyle={styles.androidDateButton}
                            minimumDate={metStartDateFilter}
                        />
                    </View>
                </View>
                <OEncounterList
                    metStartDateFilter={metStartDateFilter}
                    metEndDateFilter={metEndDateFilter}
                />
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    iosDatePicker: { marginLeft: -10 },
    androidDateButton: {
        fontSize: FontSize.size_md,
        backgroundColor: Color.brightGray,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    container: {
        flex: 1,
    },
    dateRangeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    dateContainer: {
        flex: 1,
        alignItems: "flex-start",
    },
    dateLabel: {
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratMedium,
        color: Color.gray,
        marginBottom: 5,
    },
});

export default Encounters;
