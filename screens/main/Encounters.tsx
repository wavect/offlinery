import * as React from "react";
import {useState} from "react";
import {Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {EDateStatus, IPublicProfile} from "../../types/PublicProfile.types";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from 'react-native-dropdown-picker';

interface ISingleEncounterProps {
    publicProfile: IPublicProfile
}

const SingleEncounter = (props: ISingleEncounterProps) => {
    const {publicProfile} = props;
    const {personalRelationship} = publicProfile
    const [dateStatus, setDateStatus] = useState<EDateStatus>(personalRelationship?.status || EDateStatus.NOT_MET)
    const [dateStates, setDateStates] = useState([
        {label: 'Not met', value: EDateStatus.NOT_MET},
        {label: 'Met, not interested', value: EDateStatus.MET_NOT_INTERESTED},
        {label: 'Met, interested', value: EDateStatus.MET_INTERESTED},
    ])
    const [isDateStatusDropwdownOpen, setDateStatusDropdownOpen] = useState(false)

    // TODO: Zindex (ios), elevation (android) --> still not showing above other elements when selecting a datestate
    return <View style={styles.encounterContainer}>
        <Image
            style={styles.profileImage}
            contentFit="cover"
            source={{uri: publicProfile.mainImageURI}}
        />
        <View style={styles.encounterDetails}>
            <Text style={styles.nameAge}>{`${publicProfile.firstName}, ${publicProfile.age}`}</Text>
            <Text style={styles.encounterInfo}>{`${personalRelationship?.lastTimePassedBy} near ${personalRelationship?.lastLocationPassedBy}`}</Text>

            <View style={styles.encounterDropwdownContainer}>
            <DropDownPicker value={dateStatus} setValue={setDateStatus} items={dateStates} setItems={setDateStates} zIndex={3000}
                            disabled={personalRelationship?.reported} dropDownContainerStyle={{ zIndex:3000,backgroundColor:'white',elevation:3000}}
                            style={[styles.encounterDropdownPicker, personalRelationship?.reported ? styles.encounterDropdownPickerDisabled : null]} textStyle={{fontFamily: FontFamily.montserratRegular}}
                            open={isDateStatusDropwdownOpen} setOpen={setDateStatusDropdownOpen}/>
            </View>
        </View>
        <View style={styles.rightColumn}>
            <Text style={styles.trustScore} onPress={() => alert('The higher the more trustworthy the person is (5 = best).')}>Trust ({publicProfile.rating})</Text>
            {dateStatus === EDateStatus.MET_NOT_INTERESTED && <Pressable style={personalRelationship?.reported ? styles.buttonDisabled : styles.buttonDanger} disabled={personalRelationship?.reported}>
                <Text style={styles.buttonText}>
                    {personalRelationship?.reported ? 'Reported..' : 'Report'}
                </Text>
            </Pressable>}
        </View>
    </View>
}

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
                                onChange={onMetStartDateFilterChange}
                                accessibilityLabel="We met from"
                                value={metStartDateFilter}
                            />
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                                    <Text style={styles.dateButton}>{metStartDateFilter.toDateString()}</Text>
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
                                onChange={onMetEndDateFilterChange}
                                accessibilityLabel="to this date"
                                value={metEndDateFilter}
                            />
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                                    <Text style={styles.dateButton}>{metEndDateFilter.toDateString()}</Text>
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
                    {encounters.map((encounter, idx) => <SingleEncounter key={idx} publicProfile={encounter}/>)}
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
    dateButton: {
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
    encounterDropwdownContainer: {
      zIndex: 3000,
    },
    encounterDropdownPickerDisabled: {
        backgroundColor: Color.brightGray,
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
    encounterContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Color.lightGray,
        paddingBottom: 10,
        zIndex: 1,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    encounterDetails: {
        flex: 1,
        marginLeft: 15,
        zIndex: 2,
    },
    nameAge: {
        fontSize: FontSize.size_xl,
        fontFamily: FontFamily.montserratMedium,
        marginBottom: 5,
    },
    encounterInfo: {
        fontFamily: FontFamily.montserratRegular,
        marginBottom: 10,
    },
    rightColumn: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    trustScore: {
        fontFamily: FontFamily.montserratSemiBold,
    },
    buttonDanger: {
        backgroundColor: Color.red,
        borderColor: '#c00f0c',
        borderWidth: 1,
        borderRadius: 8,
        padding: 7,
    },
    buttonDisabled: {
        borderRadius: 8,
        padding: 7,
        backgroundColor: Color.lightGray,
        borderColor: Color.gray,
        color: Color.white,
        borderWidth: 1,
    },
    buttonText: {
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
});

export default Encounters;