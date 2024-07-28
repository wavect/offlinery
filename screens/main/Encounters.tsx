import * as React from "react";
import {useState} from "react";
import {FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {EDateStatus, IPublicProfile} from "../../types/PublicProfile.types";
import {MaterialIcons} from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from 'react-native-dropdown-picker';

interface ISingleEncounterProps {
    publicProfile: IPublicProfile
}

const SingleEncounter = (props: ISingleEncounterProps) => {
    const {publicProfile} = props;
    const [dateStatus, setDateStatus] = useState<EDateStatus>(EDateStatus.NOT_MET)
    const [dateStates, setDateStates] = useState([
        {label: 'Not met', value: EDateStatus.NOT_MET},
        {label: 'Met, not interested', value: EDateStatus.MET_NOT_INTERESTED},
        {label: 'Met, interested', value: EDateStatus.MET_INTERESTED},
    ])
    const [isDateStatusDropwdownOpen, setDateStatusDropdownOpen] = useState(false)

    return <View style={styles.encounterContainer}>
        <Image
            style={styles.profileImage}
            contentFit="cover"
            source={{uri: publicProfile.mainImageURI}}
        />
        <View style={styles.encounterDetails}>
            <Text style={styles.nameAge}>{`${publicProfile.firstName}, ${publicProfile.age}`}</Text>
            <Text style={styles.encounterInfo}>4 days ago near Altstadt</Text>

            <DropDownPicker value={dateStatus} setValue={setDateStatus} items={dateStates} setItems={setDateStates}
                            open={isDateStatusDropwdownOpen} setOpen={setDateStatusDropdownOpen}/>
        </View>
        <View style={styles.rightColumn}>
            <MaterialIcons
                style={styles.ratingImage}
                name="star-border"
                size={32}
            />
            <Pressable style={styles.buttonDanger}>
                <Text style={styles.buttonText}>Report</Text>
            </Pressable>
        </View>
    </View>
}

const Encounters = () => {
    const today = new Date()
    const twoWeeksBefore = new Date();
    twoWeeksBefore.setDate(today.getDate() - 14);
    const [metStartDateFilter, onMetStartDateFilterChange] = useState<Date | undefined>(twoWeeksBefore)
    const [metEndDateFilter, onMetEndDateFilterChange] = useState<Date | undefined>(today)

    // TODO: fetch from server
    const encounters: IPublicProfile[] = [
        {
            firstName: 'Kevin',
            age: '27',
            rating: 4,
            mainImageURI: 'https://wavect.io/img/team/kevin.webp',
            personalRelationship: {
                lastTimePassedBy: new Date(2024, 7, 20, 13, 5, 1),
                status: EDateStatus.NOT_MET,
            }
        },
    ];

    return (
        <OPageContainer subtitle="People you might have met. Rate them, Report them or stay in touch." doNotUseScrollView={true}>
            <View style={styles.container}>
                <View style={styles.dateRangeContainer}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>From</Text>
                        <RNDateTimePicker
                            display="default"
                            mode="date"
                            onChange={(_, val) => onMetStartDateFilterChange(val)}
                            accessibilityLabel="We met from"
                            value={metStartDateFilter || twoWeeksBefore}
                        />
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>To</Text>
                        <RNDateTimePicker
                            display="default"
                            mode="date"
                            onChange={(_, val) => onMetEndDateFilterChange(val)}
                            accessibilityLabel="to this date"
                            value={metEndDateFilter || today}
                        />
                    </View>
                </View>

                <ScrollView style={styles.encountersList}>
                    {encounters.map((encounter, idx) => <SingleEncounter key={idx} publicProfile={encounter}/>)}
                </ScrollView>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    encounterDetails: {
        flex: 1,
        marginLeft: 15,
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
    selectField: {
        marginTop: 5,
    },
    select: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Color.gray,
        borderRadius: 8,
        padding: 8,
    },
    value: {
        flex: 1,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
    chevronDownIcon: {
        marginLeft: 5,
    },
    rightColumn: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    ratingImage: {
        marginBottom: 10,
    },
    buttonDanger: {
        backgroundColor: Color.red,
        borderColor: '#c00f0c',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
    },
    buttonText: {
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
});

export default Encounters;