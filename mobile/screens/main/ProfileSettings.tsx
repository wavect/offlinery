import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import {
    UserControllerUpdateUserRequest,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTOGenderDesireEnum,
    UserPrivateDTOGenderEnum,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import {
    EDateTimeFormatters,
    ODateTimePicker,
} from "@/components/ODateTimePicker/ODateTimePicker";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import {
    EACTION_USER,
    getUserImagesForUpload,
    mapRegionToBlacklistedRegionDTO,
    resetUserData,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { MainScreenTabsParamList } from "@/screens/main/MainScreenTabs.navigator";
import { refreshUserData } from "@/services/auth.service";
import { deleteSessionDataFromStorage } from "@/services/secure-storage.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import { GDPR_URL } from "@/utils/general.constants";
import { A } from "@expo/html-elements";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const ProfileSettings = ({
    navigation,
}: BottomTabScreenProps<MainScreenTabsParamList, typeof ROUTES.MainTabView> &
    NativeStackScreenProps<MainStackParamList, typeof ROUTES.MainTabView>) => {
    const { state, dispatch } = useUserContext();
    const [isLoading, setLoading] = useState(false);

    const setFirstName = async (firstName: string) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { firstName },
        });
    };
    const setApproachFromTime = (fromTime?: Date) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { approachFromTime: fromTime || state.approachFromTime },
        });
    };
    const setApproachToTime = (toTime?: Date) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { approachToTime: toTime || state.approachToTime },
        });
    };
    const setBio = (bio: string) => {
        dispatch({ type: EACTION_USER.UPDATE_MULTIPLE, payload: { bio } });
    };
    const setBirthday = (birthday?: Date) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { birthDay: birthday || state.birthDay },
        });
    };
    const setGender = (item: {
        label: string;
        value: UserPrivateDTOGenderEnum;
    }) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { gender: item.value },
        });
    };
    const setGenderDesire = (item: {
        label: string;
        value: UserPrivateDTOGenderDesireEnum;
    }) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { genderDesire: item.value },
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const request: UserControllerUpdateUserRequest = {
                userId: state.id!,
                updateUserDTO: {
                    firstName: state.firstName,
                    approachFromTime: state.approachFromTime.toISOString(),
                    approachToTime: state.approachToTime.toISOString(),
                    bio: state.bio,
                    birthDay: state.birthDay,
                    gender: state.gender,
                    genderDesire: state.genderDesire,
                    blacklistedRegions: state.blacklistedRegions.map((r) =>
                        mapRegionToBlacklistedRegionDTO(r),
                    ),
                },
                images: getUserImagesForUpload(state),
            };

            await API.user.userControllerUpdateUser(request);

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

    const genderItems: { label: string; value: UserPrivateDTOGenderEnum }[] = [
        { label: i18n.t(TR.woman), value: "woman" },
        { label: i18n.t(TR.man), value: "man" },
    ];

    const genderLookingForItems: {
        label: string;
        value: UserPrivateDTOGenderEnum;
    }[] = [
        { label: i18n.t(TR.women), value: "woman" },
        { label: i18n.t(TR.men), value: "man" },
    ];

    const SettingsButton = (props: {
        testID?: string;
        onPress: any;
        icon: any;
        text: string;
        style?: any;
    }) => {
        const { onPress, icon, text } = props;
        return (
            <TouchableOpacity
                testID={props.testID}
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

    const refresh = async () => {
        const updatedUser = await API.user.userControllerGetOwnUserData({
            userId: state.id!,
        });
        refreshUserData(dispatch, updatedUser);
    };

    const handleDeleteAccount = async () => {
        try {
            await API.user.userControllerRequestAccountDeletion({
                userId: state.id!,
            });
            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { markedForDeletion: true },
            });
            alert(i18n.t(TR.accountDeletionRequestedAlert));
        } catch (err) {
            throw err;
        }
    };

    const handleLogout = async () => {
        await deleteSessionDataFromStorage();
        resetUserData(dispatch);
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: ROUTES.Welcome }],
            }),
        );
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.changePreferencesDescr)}
            refreshFunc={refresh}
        >
            <View style={styles.container} testID={TestData.settings.page}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{i18n.t(TR.myFirstNameIs)}</Text>
                    <OTextInput
                        testID={TestData.settings.inputFirstName}
                        value={state.firstName}
                        onChangeText={setFirstName}
                        placeholder={i18n.t(TR.enterFirstName)}
                        containerStyle={styles.input}
                    />
                </View>

                {state.approachChoice !==
                    UserPrivateDTOApproachChoiceEnum.approach && (
                    <View style={styles.timePickerContainer}>
                        <Text style={[styles.label, { marginBottom: 8 }]}>
                            {i18n.t(TR.approachMeBetween)}
                        </Text>
                        <View style={styles.timePickerRow}>
                            <View style={styles.timePicker}>
                                <Text>{i18n.t(TR.from)}</Text>
                                <ODateTimePicker
                                    value={new Date(state.approachFromTime)}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={(event, selectedTime) =>
                                        setApproachFromTime(selectedTime)
                                    }
                                    dateTimeFormatter={EDateTimeFormatters.TIME}
                                    androidTextStyle={
                                        styles.androidDateTimeValue
                                    }
                                />
                            </View>
                            <View style={styles.timePicker}>
                                <Text>{i18n.t(TR.until)}</Text>
                                <ODateTimePicker
                                    value={new Date(state.approachToTime)}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={(event, selectedTime) =>
                                        setApproachToTime(selectedTime)
                                    }
                                    dateTimeFormatter={EDateTimeFormatters.TIME}
                                    androidTextStyle={
                                        styles.androidDateTimeValue
                                    }
                                />
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{i18n.t(TR.bio)}</Text>
                    <OTextInput
                        testID={TestData.settings.inputBio}
                        value={state.bio}
                        onChangeText={setBio}
                        placeholder={i18n.t(TR.noPickUpLinesBeChill)}
                        multiline={true}
                        containerStyle={[styles.input, styles.multiline_input]}
                    />
                </View>

                <View
                    style={styles.datePickerContainer}
                    testID={TestData.settings.labelBirthday}
                >
                    <Text style={styles.label}>{i18n.t(TR.myBirthDayIs)}</Text>
                    <ODateTimePicker
                        value={state.birthDay}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) =>
                            setBirthday(selectedDate)
                        }
                        dateTimeFormatter={EDateTimeFormatters.DATE}
                        androidTextStyle={styles.androidDateTimeValue}
                    />
                </View>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>{i18n.t(TR.iAmA)}</Text>
                    <Dropdown
                        testID={TestData.settings.inputIAmA}
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
                        testID={TestData.settings.inputIAmLookingFor}
                        data={genderLookingForItems}
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
                        testID={TestData.settings.buttonUpdateImages}
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
                        testID={TestData.settings.buttonUpdateSafeZones}
                        onPress={() =>
                            navigation.navigate(ROUTES.MainTabView, {
                                screen: ROUTES.Main.FindPeople,
                            })
                        }
                        icon="location-off"
                        text={i18n.t(TR.updateSafeZones)}
                    />
                    <SettingsButton
                        testID={TestData.settings.buttonChangePassword}
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
                        testID={TestData.settings.buttonHouseRules}
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

                <View style={styles.buttonContainer}>
                    <OButtonWide
                        testID={TestData.settings.buttonSafe}
                        style={{ marginTop: 10, width: "100%" }}
                        text={i18n.t(TR.save)}
                        filled={true}
                        variant="dark"
                        isLoading={isLoading}
                        loadingBtnText={i18n.t(TR.saving)}
                        onPress={handleSave}
                    />
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerZoneTitle}>
                        {i18n.t(TR.dangerZone)}
                    </Text>
                    <View style={styles.dangerButtonsContainer}>
                        <TouchableOpacity
                            testID={TestData.settings.buttonDangerLogout}
                            style={styles.dangerButton}
                            onPress={handleLogout}
                        >
                            <MaterialIcons
                                name="logout"
                                size={24}
                                color={Color.redDark}
                            />
                            <Text style={styles.dangerButtonText}>
                                {i18n.t(TR.logout)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID={TestData.settings.buttonDangerDeleteAccount}
                            style={styles.dangerButton}
                            onPress={handleDeleteAccount}
                            disabled={state.markedForDeletion}
                        >
                            <MaterialIcons
                                name="delete-forever"
                                size={24}
                                color={
                                    state.markedForDeletion
                                        ? Color.gray
                                        : Color.redDark
                                }
                            />
                            <Text
                                style={[
                                    styles.dangerButtonText,
                                    state.markedForDeletion
                                        ? styles.disabledDangerButtonText
                                        : null,
                                ]}
                            >
                                {i18n.t(
                                    state.markedForDeletion
                                        ? TR.deletionRequested
                                        : TR.deleteAccount,
                                )}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.gdprContainer}>
                    <A href={GDPR_URL} style={styles.gdpr}>
                        {i18n.t(TR.termsDisclaimer.privacyCookie)}
                    </A>
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    gdpr: {
        textDecorationLine: "underline",
        color: Color.gray,
        textAlign: "center",
    },
    gdprContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    buttonContainer: {
        alignItems: "center",
    },
    dropdownContainer: {
        marginBottom: 16,
        zIndex: 1000,
    },
    dropdown: {
        marginTop: 8,
        height: 45,
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
        zIndex: 10000,
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
        height: 45,
        width: "100%",
    },
    multiline_input: {
        height: 70,
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
        marginTop: 6,
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
    dangerZone: {
        marginTop: 30,
        padding: 16,
        borderWidth: 2,
        borderColor: Color.redDark,
        borderRadius: 8,
    },
    dangerZoneTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Color.redDark,
        marginBottom: 16,
        fontFamily: FontFamily.montserratSemiBold,
    },
    dangerButtonsContainer: {
        flexDirection: "column",
    },
    dangerButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    disabledDangerButtonText: {
        color: Color.gray,
    },
    dangerButtonText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: FontFamily.montserratMedium,
    },
    androidDateTimeValue: {
        fontSize: FontSize.size_md,
        backgroundColor: Color.brightGray,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginLeft: 10,
    },
});

export default ProfileSettings;
