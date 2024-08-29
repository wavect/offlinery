import * as React from "react";
import {ActivityIndicator, Pressable, StyleSheet, Text} from "react-native";
import {Color, FontFamily, FontSize} from "../../GlobalStyles";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import OEncounter from "../../components/OEncounter/OEncounter";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {Dropdown} from "react-native-element-dropdown";
import {useState} from "react";
import {OCheckbox} from "../../components/OCheckbox/OCheckbox";
import {EACTION_ENCOUNTERS, useEncountersContext} from "../../context/EncountersContext";
import {useUserContext} from "../../context/UserContext";
import {i18n, TR} from "../../localization/translate.service";
import {CreateUserReportDTO, CreateUserReportDTOIncidentTypeEnum, UserReportsApi} from "../../api/gen/src";

const reportApi = new UserReportsApi()
const ReportEncounter = ({route, navigation}) => {
    const {state} = useUserContext()
    const {dispatch} = useEncountersContext()
    const [isLoading, setLoading] = useState(false)
    const {personToReport} = route.params;
    const [incidentDescription, setIncidentDescription] = useState<string>()
    const [keepMeInTheLoop, setKeepMeInTheLoop] = useState<boolean>(false)
    const [incidentType, setIncidentType] = useState<CreateUserReportDTOIncidentTypeEnum | null>(null)
    const [incidents, setIncidents] = useState([
        {label: i18n.t(TR.reportIncident.disrespectful), value: CreateUserReportDTOIncidentTypeEnum.Disrespectful},
        {label: i18n.t(TR.reportIncident.sexualHarassment), value: CreateUserReportDTOIncidentTypeEnum.Sexual_harassment},
        {label: i18n.t(TR.reportIncident.violentBehavior), value: CreateUserReportDTOIncidentTypeEnum.Violent_behavior},
        {label: i18n.t(TR.reportIncident.other), value: CreateUserReportDTOIncidentTypeEnum.Other},
    ])
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    const submitReport = async () => {
        try {
            setLoading(true)
            const createUserReportDTO: CreateUserReportDTO = {
                incidentDescription: incidentDescription!,
                keepReporterInTheLoop: keepMeInTheLoop,
                incidentType: incidentType!,
                reportedUserId: personToReport.id, // Assuming personToReport has an id field
                reportingUserId: state.id!, // You need to provide the current user's ID here
            };

            await reportApi.userReportControllerCreate({ createUserReportDTO });

            dispatch({
                type: EACTION_ENCOUNTERS.SET_REPORTED,
                payload: {encounterId: personToReport.encounterId, value: true},
            })
            navigation.goBack()
        } catch(err) {
            console.error(err, JSON.stringify(err))
            // TODO
        } finally {
            setLoading(false)
        }
    }

    /** @dev Form properly filled out? */
        // TODO: Add minimum length (show on UI as on password view)
    const isValidReport = incidentDescription?.length && incidentType

    return (
        <OPageContainer
            subtitle={i18n.t(TR.onlyReportThatWasDisrespectful)}>
            <OEncounter encounterProfile={personToReport} showActions={false} navigation={navigation}/>

            <Text style={styles.label}>{i18n.t(TR.typeOfIncident)}</Text>
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={incidents}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={i18n.t(TR.selectIncidentType)}
                searchPlaceholder={i18n.t(TR.search)}
                value={incidentType}
                onChange={item => {
                    setIncidentType(item.value);
                }}
            />

            <Text style={styles.label}>What happened?</Text>
            <OTextInput value={incidentDescription ?? ''} setValue={setIncidentDescription}
                        placeholder={i18n.t(TR.describeIncident)} multiline={true}/>

            <OCheckbox checkboxState={keepMeInTheLoop} onValueChange={setKeepMeInTheLoop}
                       label={i18n.t(TR.keepMeInTheLoopEmail)} style={{marginTop: 20}}/>

            <Pressable style={[
                styles.buttonBase,
                isValidReport ? styles.buttonDanger : styles.buttonDisabled,
                isButtonPressed && styles.buttonPressed]}
                       disabled={!isValidReport}
                       onPressIn={() => setIsButtonPressed(true)}
                       onPressOut={() => setIsButtonPressed(false)}
                       onPress={submitReport}>
                <Text style={styles.buttonText}>
                    {isLoading && <ActivityIndicator size="small" style={{marginRight: 6}}/>}
                    {i18n.t(TR.reportNow)}
                </Text>
            </Pressable>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    placeholderStyle: {
        fontSize: 16,
        fontFamily: FontFamily.montserratRegular,
    },
    selectedTextStyle: {
        fontSize: 16,
        fontFamily: FontFamily.montserratRegular,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        fontFamily: FontFamily.montserratRegular,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    label: {
        fontFamily: FontFamily.montserratMedium,
        fontSize: FontSize.size_md,
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
        justifyContent: "center",
        alignItems: "center",
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