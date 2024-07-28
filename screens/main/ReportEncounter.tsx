import * as React from "react";
import {Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import OEncounter from "../../components/OEncounter/OEncounter";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import DropDownPicker from "react-native-dropdown-picker";
import {useState} from "react";
import {EDateStatus} from "../../types/PublicProfile.types";
import {OCheckbox} from "../../components/OCheckbox/OCheckbox";
import {ROUTES} from "../routes";
import {EACTION_ENCOUNTERS, useEncountersContext} from "../../context/EncountersContext";

enum EIncidentType {
    Disrespectful = 'Disrespectful',
    SexualHarassment = 'Sexual harassment',
    Violent = 'Violent behavior',
    Other = 'Other',
}

const ReportEncounter = ({route, navigation}) => {
    const {dispatch} = useEncountersContext()
    const {personToReport} = route.params;
    const [incidentDescription, setIncidentDescription] = useState<string>()
    const [keepMeInTheLoop, setKeepMeInTheLoop] = useState<boolean>(false)
    const [incidentType, setIncidentType] = useState<EIncidentType | null>(null)
    const [incidents, setIncidents] = useState([
        {label: 'Disrespectful', value: EIncidentType.Disrespectful},
        {label: 'Sexual harassment', value: EIncidentType.SexualHarassment},
        {label: 'Violent behavior', value: EIncidentType.Violent},
        {label: 'Other', value: EIncidentType.Other},
    ])
    const [isIncidentDropdownOpen, setIncidentDropdownOpen] = useState(false)
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    const submitReport = () => {
        // TODO: Add backend call here
        dispatch({
            type: EACTION_ENCOUNTERS.SET_REPORTED,
            payload: {encounterId: personToReport.encounterId, value: true},
        })
        navigation.goBack()
    }

    /** @dev Form properly filled out? */
        // TODO: Add minimum length
    const isValidReport = incidentDescription?.length && incidentType

    return (
        <OPageContainer
            subtitle="Please only report people that were disrespectful, didn’t accept a No or even did misbehave in a different way.">
            <OEncounter publicProfile={personToReport} showActions={false} navigation={navigation}/>

            <Text style={styles.label}>Type of Incident</Text>
            <DropDownPicker value={incidentType} setValue={setIncidentType} items={incidents} setItems={setIncidents}
                            zIndex={3000}
                            dropDownContainerStyle={{zIndex: 3000, backgroundColor: 'white', elevation: 3000}}
                            style={[styles.encounterDropdownPicker]}
                            textStyle={{fontFamily: FontFamily.montserratRegular}}
                            open={isIncidentDropdownOpen} setOpen={setIncidentDropdownOpen}/>

            <Text style={styles.label}>What happened?</Text>
            <OTextInput value={incidentDescription} setValue={setIncidentDescription}
                        placeholder='Describe the incident / misbehavior' multiline={true}/>

            <OCheckbox checkboxState={keepMeInTheLoop} onValueChange={setKeepMeInTheLoop}
                       label='Please keep me in the loop via email.' style={{marginTop: 20}}/>

            <Pressable style={[
                styles.buttonBase,
                isValidReport ? styles.buttonDanger : styles.buttonDisabled,
                isButtonPressed && styles.buttonPressed]}
                       disabled={!isValidReport}
                       onPressIn={() => setIsButtonPressed(true)}
                       onPressOut={() => setIsButtonPressed(false)}
                       onPress={submitReport}>
                <Text style={styles.buttonText}>
                    Report now
                </Text>
            </Pressable>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    label: {
        fontFamily: FontFamily.montserratMedium,
        fontSize: FontSize.medium,
        marginTop: 24,
        marginBottom: 8,
    },
    encounterDropdownPicker: {
        marginBottom: 16,
    },
    buttonBase: {
        marginTop: 50,
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
    },
    buttonDanger: {
        backgroundColor: Color.red,
        borderColor: '#c00f0c',
    },
    buttonText: {
        textAlign: 'center',
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontSize: FontSize.size_md,
    },
    buttonDisabled: {
        backgroundColor: Color.lightGray,
        borderColor: Color.gray,
    },
    buttonPressed: {
        opacity: 0.7,
    },
});

export default ReportEncounter;