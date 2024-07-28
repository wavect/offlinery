import * as React from "react";
import {useState} from "react";
import {Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {EDateStatus, IPublicProfile} from "../../types/PublicProfile.types";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import OSingleEncounter from "../../components/OSingleEncounter/OSingleEncounter";

const Encounters = () => {
    const today = new Date()
    const twoWeeksBefore = new Date();
    twoWeeksBefore.setDate(today.getDate() - 14);
    const [metStartDateFilter, setMetStartDateFilter] = useState<Date>(twoWeeksBefore)
    const [metEndDateFilter, setMetEndDateFilter] = useState<Date>(today)
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const onMetStartDateFilterChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setMetStartDateFilter(selectedDate);
        }
    };

    const onMetEndDateFilterChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setMetEndDateFilter(selectedDate);
        }
    };

    // TODO: fetch from server
    const encounters: IPublicProfile[] = [
        {
            firstName: 'Kevin',
            age: '27',
            rating: 4,
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                lastTimePassedBy: '4 days ago',
                lastLocationPassedBy: 'Altstadt Innsbruck',
                status: EDateStatus.NOT_MET,
                reported: false,
            }
        },
        {
            firstName: 'Kev',
            age: '28',
            rating: 3.4,
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                lastTimePassedBy: '3 hours ago',
                lastLocationPassedBy: 'Marien-Theresien-Straße 1',
                status: EDateStatus.MET_NOT_INTERESTED,
                reported: false,
            }
        },
        {
            firstName: 'Kev',
            age: '28',
            rating: 3.4,
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                lastTimePassedBy: '1 week ago',
                lastLocationPassedBy: 'Cafe Katzung',
                status: EDateStatus.MET_NOT_INTERESTED,
                reported: true,
            }
        },
    ];

    return (
        <OPageContainer subtitle="People you might have met. Rate them, Report them or stay in touch." doNotUseScrollView={true}>
            <View style={styles.container}>
                <View style={styles.dateRangeContainer}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>From</Text>
                        {Platform.OS === 'ios' ? (
                            <RNDateTimePicker
                                display="default"
                                mode="date"
                                style={styles.iosDatePicker}
                                onChange={onMetStartDateFilterChange}
                                accessibilityLabel="We met from"
                                value={metStartDateFilter}
                            />
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                                    <Text style={styles.androidDateButton}>{metStartDateFilter.toDateString()}</Text>
                                </TouchableOpacity>
                                {showStartDatePicker && (
                                    <RNDateTimePicker
                                        value={metStartDateFilter}
                                        mode="date"
                                        display="default"
                                        onChange={onMetStartDateFilterChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>To</Text>
                        {Platform.OS === 'ios' ? (
                            <RNDateTimePicker
                                display="default"
                                mode="date"
                                style={styles.iosDatePicker}
                                onChange={onMetEndDateFilterChange}
                                accessibilityLabel="to this date"
                                value={metEndDateFilter}
                            />
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                                    <Text style={styles.androidDateButton}>{metEndDateFilter.toDateString()}</Text>
                                </TouchableOpacity>
                                {showEndDatePicker && (
                                    <RNDateTimePicker
                                        value={metEndDateFilter}
                                        mode="date"
                                        display="default"
                                        onChange={onMetEndDateFilterChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>

                {encounters.length
                    && <ScrollView style={styles.encountersList}>
                    {encounters.map((encounter, idx) => <OSingleEncounter key={idx} publicProfile={encounter}/>)}
                </ScrollView>
                    || <View style={styles.noEncountersContainer}>
                    <Text style={styles.noEncountersTextLg}>Nobody was nearby..</Text>
                        <Text style={styles.noEncountersTextSm}>(hint: mingle with the crowd)</Text>
                </View>}


            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    iosDatePicker: {marginLeft: -10},
    androidDateButton: {
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratRegular,
        color: Color.black,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Color.lightGray,
        borderRadius: 5,
    },
    noEncountersContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noEncountersTextLg: {
        fontFamily: FontFamily.montserratMedium,
        fontSize: FontSize.size_md,
        color: Color.gray,
    },
    noEncountersTextSm: {
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_sm,
        color: Color.gray,
    },
    container: {
        flex: 1,
    },
    encounterDropdownPicker: {
        maxWidth: '95%',
        height: 35,
        maxHeight: 35,
        minHeight: 35,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dateContainer: {
        flex: 1,
        alignItems: "flex-start"
    },
    dateLabel: {
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratMedium,
        color: Color.gray,
        marginBottom: 5,
    },
    encountersList: {
        flex: 1,
        height: '100%',
        minHeight: 400,
    },
});

export default Encounters;