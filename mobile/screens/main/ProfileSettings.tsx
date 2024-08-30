import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { UserApi, UserControllerUpdateUserRequest } from "../../api/gen/src";
import { OButtonWide } from "../../components/OButtonWide/OButtonWide";
import { OPageContainer } from "../../components/OPageContainer/OPageContainer";
import { OTextInput } from "../../components/OTextInput/OTextInput";
import {
    EACTION_USER,
    EApproachChoice,
    Gender,
    getUserImagesForUpload,
    useUserContext,
} from "../../context/UserContext";
import { FontFamily, FontSize } from "../../GlobalStyles";
import { i18n, TR } from "../../localization/translate.service";
import { ROUTES } from "../routes";

const userApi = new UserApi();
const ProfileSettings = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);

    if (!state.id) {
        // TODO REMOVE
        dispatch({ type: EACTION_USER.SET_ID, payload: 1 });
    }

    const setFirstName = async (firstName: string) => {
        dispatch({ type: EACTION_USER.SET_FIRSTNAME, payload: firstName });
    };
    const setApproachFromTime = (fromTime?: Date) => {
        dispatch({
            type: EACTION_USER.SET_APPROACH_FROM_TIME,
            payload: fromTime || state.approachFromTime,
        });
    };
    const setApproachToTime = (toTime?: Date) => {
        dispatch({
            type: EACTION_USER.SET_APPROACH_TO_TIME,
            payload: toTime || state.approachToTime,
        });
    };
    const setBio = (bio: string) => {
        dispatch({ type: EACTION_USER.SET_BIO, payload: bio });
    };
    const setBirthday = (birthday?: Date) => {
        dispatch({
            type: EACTION_USER.SET_BIRTHDAY,
            payload: birthday || state.birthDay,
        });
    };
    const setGender = (item: { label: string; value: Gender }) => {
        dispatch({ type: EACTION_USER.SET_GENDER, payload: item.value });
    };
    const setGenderDesire = (item: { label: string; value: Gender }) => {
        dispatch({ type: EACTION_USER.SET_GENDER_DESIRE, payload: item.value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const request: UserControllerUpdateUserRequest = {
                id: state.id!,
                user: {
                    firstName: state.firstName,
                    approachFromTime: state.approachFromTime,
                    approachToTime: state.approachToTime,
                    bio: state.bio,
                    birthDay: state.birthDay,
                    gender: state.gender,
                    genderDesire: state.genderDesire,
                    blacklistedRegions: state.blacklistedRegions,
                },
                images: getUserImagesForUpload(state),
            };

            await userApi.userControllerUpdateUser(request, {
                headers: { Authorization: `Bearer ${state.jwtAccessToken}` },
            });

            navigation.navigate(ROUTES.MainTabView, {
                screen: ROUTES.Main.FindPeople,
            });
        } catch (error) {
            console.error("Error updating user profile:", error);
            // Handle error (e.g., show error message to user)
        } finally {
            setLoading(false);
        }
    };

    const genderItems: { label: string; value: Gender }[] = [
        { label: i18n.t(TR.woman), value: "woman" },
        { label: i18n.t(TR.man), value: "man" },
    ];

    const SettingsButton = (props: {
        onPress;
        icon;
        text: string;
        style?: any;
    }) => {
        const { onPress, icon, text } = props;
        return (
            <TouchableOpacity
                style={[styles.settingsButton, props.style]}
                onPress={onPress}
            >
                <View style={styles.settingsButtonContent}>
                    <MaterialIcons name={icon} size={30} color="#000" />
                    <Text style={styles.settingsButtonText}>{text}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.changePreferencesDescr)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.save)}
                    filled={true}
                    variant="dark"
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.saving)}
                    onPress={handleSave}
                />
            }
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <OTextInput
                        value={state.firstName}
                        setValue={setFirstName}
                        placeholder={i18n.t(TR.enterFirstName)}
                        style={styles.input}
                    />
                </View>

                {state.approachChoice !== EApproachChoice.APPROACH && (
                    <View style={styles.timePickerContainer}>
                        <Text style={[styles.label, { marginBottom: 8 }]}>
                            {i18n.t(TR.approachMeBetween)}
                        </Text>
                        <View style={styles.timePickerRow}>
                            <View style={styles.timePicker}>
                                <Text>{i18n.t(TR.from)}</Text>
                                <DateTimePicker
                                    value={new Date(state.approachFromTime)}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={(event, selectedTime) =>
                                        setApproachFromTime(selectedTime)
                                    }
                                />
                            </View>
                            <View style={styles.timePicker}>
                                <Text>{i18n.t(TR.until)}</Text>
                                <DateTimePicker
                                    value={new Date(state.approachToTime)}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={(event, selectedTime) =>
                                        setApproachToTime(selectedTime)
                                    }
                                />
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{i18n.t(TR.bio)}</Text>
                    <OTextInput
                        value={state.bio}
                        setValue={setBio}
                        placeholder={i18n.t(TR.noPickUpLinesBeChill)}
                        multiline={true}
                        style={styles.input}
                    />
                </View>

                <View style={styles.datePickerContainer}>
                    <Text style={styles.label}>{i18n.t(TR.myBirthDayIs)}</Text>
                    <DateTimePicker
                        value={state.birthDay}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) =>
                            setBirthday(selectedDate)
                        }
                    />
                </View>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>{i18n.t(TR.iAmA)}</Text>
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
                    <Text style={styles.label}>{i18n.t(TR.iLookFor)}</Text>
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
                        onPress={() =>
                            navigation.navigate(ROUTES.Onboarding.AddPhotos, {
                                overrideOnBtnPress: () =>
                                    navigation.navigate(ROUTES.MainTabView, {
                                        screen: ROUTES.Main.ProfileSettings,
                                    }),
                                overrideSaveBtnLbl: i18n.t(TR.save),
                            })
                        }
                        icon="image"
                        text={i18n.t(TR.updateImages)}
                    />
                    <SettingsButton
                        onPress={() =>
                            navigation.navigate(ROUTES.MainTabView, {
                                screen: ROUTES.Main.FindPeople,
                            })
                        }
                        icon="location-off"
                        text={i18n.t(TR.updateSafeZones)}
                    />
                    <SettingsButton
                        onPress={() =>
                            navigation.navigate(ROUTES.Onboarding.Password, {
                                nextPage: ROUTES.MainTabView,
                                isChangePassword: true,
                            })
                        }
                        icon="lock"
                        text={i18n.t(TR.changePassword)}
                    />
                </View>
                <View style={styles.settingsButtonsContainer}>
                    <SettingsButton
                        style={{ width: "100%", height: 75 }}
                        onPress={() =>
                            navigation.navigate(ROUTES.HouseRules, {
                                forceWaitSeconds: 0,
                                nextPage: ROUTES.MainTabView,
                            })
                        }
                        icon="rule"
                        text={i18n.t(TR.houseRules.mainTitle)}
                    />
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
        borderColor: "gray",
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    dropdownContainerStyle: {
        borderRadius: 8,
    },
    dropdownPlaceholderStyle: {
        fontSize: 16,
        color: "gray",
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
        fontWeight: "bold",
        fontFamily: FontFamily.montserratSemiBold,
    },
    timePickerContainer: {
        marginBottom: 16,
    },
    timePickerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    timePicker: {
        flexDirection: "row",
        alignItems: "center",
    },
    datePickerContainer: {
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    settingsButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        marginTop: 12,
    },
    settingsButton: {
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        padding: 10,
        width: "31%",
        height: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    settingsButtonContent: {
        alignItems: "center",
    },
    settingsButtonText: {
        marginTop: 8,
        fontSize: FontSize.size_sm,
        textAlign: "center",
        fontFamily: FontFamily.montserratMedium,
    },
});

export default ProfileSettings;
