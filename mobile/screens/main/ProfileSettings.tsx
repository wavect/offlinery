import * as React from "react";
import {useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import {Dropdown} from "react-native-element-dropdown";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {OTextInput} from "../../components/OTextInput/OTextInput";
import {FontFamily, FontSize, Subtitle, Title} from "../../GlobalStyles";
import {ROUTES} from "../routes";
import {EACTION_USER, EDateMode, Gender, useUserContext} from "../../context/UserContext";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import {MaterialIcons} from "@expo/vector-icons";

const ProfileSettings = ({navigation}) => {
    const {state, dispatch} = useUserContext();

    const setFirstName = (firstName: string) => {
        dispatch({type: EACTION_USER.SET_FIRSTNAME, payload: firstName})
    }
    const setApproachFromTime = (fromTime?: Date) => {
        dispatch({type: EACTION_USER.SET_APPROACH_FROM_TIME, payload: fromTime || state.approachFromTime})
    }
    const setApproachToTime = (toTime?: Date) => {
        dispatch({type: EACTION_USER.SET_APPROACH_TO_TIME, payload: toTime || state.approachToTime})
    }
    const setBio = (bio: string) => {
        dispatch({type: EACTION_USER.SET_BIO, payload: bio})
    }
    const setBirthday = (birthday?: Date) => {
        dispatch({type: EACTION_USER.SET_BIRTHDAY, payload: birthday || state.birthDay})
    }
    const setGender = (item: { label: string, value: Gender }) => {
        dispatch({type: EACTION_USER.SET_GENDER, payload: item.value})
    }
    const setGenderDesire = (item: { label: string, value: Gender }) => {
        dispatch({type: EACTION_USER.SET_GENDER_DESIRE, payload: item.value})
    }

    const handleSave = () => {
        // TODO: Save to backend.
        navigation.navigate(ROUTES.MainTabView, {screen: ROUTES.Main.FindPeople})
    };

    const genderItems: { label: string, value: Gender }[] = [
        {label: 'Woman', value: 'woman'},
        {label: 'Man', value: 'man'},
    ];

    const SettingsButton = ({onPress, icon, text}) => (
        <TouchableOpacity style={styles.settingsButton} onPress={onPress}>
            <View style={styles.settingsButtonContent}>
                <MaterialIcons name={icon} size={30} color="#000"/>
                <Text style={styles.settingsButtonText}>{text}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <OPageContainer subtitle='Change your preferences or update your profile.'
                        bottomContainerChildren={<OButtonWide text="Save" filled={true} variant="dark"
                                                              onPress={handleSave}/>}>
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <OTextInput
                        value={state.firstName}
                        setValue={setFirstName}
                        placeholder='Your first name'
                        style={styles.input}
                    />
                </View>

                <View style={styles.timePickerContainer}>
                    <Text style={[styles.label, {marginBottom: 8}]}>Approach Time</Text>
                    <View style={styles.timePickerRow}>
                        <View style={styles.timePicker}>
                            <Text>From:</Text>
                            <DateTimePicker
                                value={state.approachFromTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={(event, selectedTime) => setApproachFromTime(selectedTime)}
                            />
                        </View>
                        <View style={styles.timePicker}>
                            <Text>To:</Text>
                            <DateTimePicker
                                value={state.approachToTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={(event, selectedTime) => setApproachToTime(selectedTime)}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Bio</Text>
                    <OTextInput
                        value={state.bio}
                        setValue={setBio}
                        placeholder='Please just be kind.'
                        multiline={true}
                        style={styles.input}
                    />
                </View>

                <View style={styles.datePickerContainer}>
                    <Text style={styles.label}>Birthday</Text>
                    <DateTimePicker
                        value={state.birthDay}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => setBirthday(selectedDate)}
                    />
                </View>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Gender</Text>
                    <Dropdown
                        data={genderItems}
                        labelField="label"
                        valueField="value"
                        value={state.gender}
                        onChange={setGender}
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainerStyle}
                        placeholderStyle={styles.dropdownPlaceholderStyle}
                        selectedTextStyle={styles.dropdownSelectedTextStyle}
                        itemTextStyle={styles.dropdownItemTextStyle}
                    />
                </View>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Looking for</Text>
                    <Dropdown
                        data={genderItems}
                        labelField="label"
                        valueField="value"
                        value={state.genderDesire}
                        onChange={setGenderDesire}
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainerStyle}
                        placeholderStyle={styles.dropdownPlaceholderStyle}
                        selectedTextStyle={styles.dropdownSelectedTextStyle}
                        itemTextStyle={styles.dropdownItemTextStyle}
                    />
                </View>

                <View style={styles.settingsButtonsContainer}>
                    <SettingsButton
                        onPress={() => navigation.navigate(ROUTES.Onboarding.AddPhotos, {
                            overrideOnBtnPress: () => navigation.navigate(ROUTES.MainTabView, {screen: ROUTES.Main.ProfileSettings}),
                            overrideSaveBtnLbl: 'Save'
                        })}
                        icon="image" text="Update Images"/>
                    <SettingsButton
                        onPress={() => navigation.navigate(ROUTES.MainTabView, {screen: ROUTES.Main.FindPeople})}
                        icon="location-off" text="Update Safe Zones"/>
                    <SettingsButton onPress={() => navigation.navigate(ROUTES.HouseRules, {
                        forceWaitSeconds: 0,
                        nextPage: ROUTES.MainTabView
                    })} icon="rule" text="House Rules"/>
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    // ... (keep existing styles)

    dropdownContainer: {
        marginBottom: 16,
        zIndex: 1000,
    },
    dropdown: {
        marginTop: 8,
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    dropdownContainerStyle: {
        borderRadius: 8,
    },
    dropdownPlaceholderStyle: {
        fontSize: 16,
        color: 'gray',
    },
    dropdownSelectedTextStyle: {
        fontSize: 16,
    },
    dropdownItemTextStyle: {
        fontSize: 16,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        marginTop: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FontFamily.montserratSemiBold,
    },
    timePickerContainer: {
        marginBottom: 16,
    },
    timePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    datePickerContainer: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingsButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 12,
    },
    settingsButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        width: '31%',
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButtonContent: {
        alignItems: 'center',
    },
    settingsButtonText: {
        marginTop: 8,
        fontSize: FontSize.size_sm,
        textAlign: 'center',
        fontFamily: FontFamily.montserratMedium,
    },
});

export default ProfileSettings;