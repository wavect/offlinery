import {EDateStatus, IPublicProfile} from "../../types/PublicProfile.types";
import {useState} from "react";
import {Image, Pressable, Text, View, StyleSheet} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";
import * as React from "react";


interface ISingleEncounterProps {
    publicProfile: IPublicProfile
}

const OSingleEncounter = (props: ISingleEncounterProps) => {
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

const styles = StyleSheet.create({
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
});

export default OSingleEncounter