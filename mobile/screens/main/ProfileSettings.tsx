import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import {
    UserApi,
    UserApproachChoiceEnum,
    UserControllerUpdateUserRequest,
    UserGenderEnum,
} from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OTextInput } from "@/components/OTextInput/OTextInput";
import {
    EACTION_USER,
    getUserImagesForUpload,
    mapRegionToBlacklistedRegionDTO,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { MainScreenTabsParamList } from "@/screens/main/MainScreenTabs.navigator";
import {
    clearSessionDataFromUserContext,
    refreshUserData,
} from "@/services/auth.service";
import { deleteSessionDataFromStorage } from "@/services/secure-storage.service";
import { includeJWT } from "@/utils/misc.utils";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

const userApi = new UserApi();
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
    const setGender = (item: { label: string; value: UserGenderEnum }) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { gender: item.value },
        });
    };
    const setGenderDesire = (item: {
        label: string;
        value: UserGenderEnum;
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
                user: {
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

            await userApi.userControllerUpdateUser(request, await includeJWT());

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

    const genderItems: { label: string; value: UserGenderEnum }[] = [
        { label: i18n.t(TR.woman), value: "woman" },
        { label: i18n.t(TR.man), value: "man" },
    ];

    const SettingsButton = (props: {
        onPress: any;
        icon: any;
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

    const refresh = async () => {
        const updatedUser = await userApi.userControllerGetOwnUserData(
            {
                userId: state.id!,
            },
            await includeJWT(),
        );
        refreshUserData(dispatch, updatedUser);
    };

    const handleDeleteAccount = () => {
        alert(
            "This feature is coming asap! In the meantime please email us at office@offlinery.io",
        );
    };

    const handleLogout = async () => {
        clearSessionDataFromUserContext(dispatch);
        await deleteSessionDataFromStorage();
        navigation.navigate(ROUTES.Welcome);
    };

    return (
        <OPageContainer
            subtitle={i18n.t(TR.changePreferencesDescr)}
            refreshFunc={refresh}
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{i18n.t(TR.myFirstNameIs)}</Text>
                    <OTextInput
                        value={state.firstName}
                        onChangeText={setFirstName}
                        placeholder={i18n.t(TR.enterFirstName)}
                        containerStyle={styles.input}
                    />
                </View>

                {state.approachChoice !== UserApproachChoiceEnum.approach && (
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
                        onChangeText={setBio}
                        placeholder={i18n.t(TR.noPickUpLinesBeChill)}
                        multiline={true}
                        containerStyle={[styles.input, styles.multiline_input]}
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

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerZoneTitle}>
                        {i18n.t(TR.dangerZone)}
                    </Text>
                    <View style={styles.dangerButtonsContainer}>
                        <TouchableOpacity
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
                            style={styles.dangerButton}
                            onPress={handleDeleteAccount}
                        >
                            <MaterialIcons
                                name="delete-forever"
                                size={24}
                                color={Color.redDark}
                            />
                            <Text style={styles.dangerButtonText}>
                                {i18n.t(TR.deleteAccount)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <OButtonWide
                        style={{ marginTop: 10, width: "100%" }}
                        text={i18n.t(TR.save)}
                        filled={true}
                        variant="dark"
                        isLoading={isLoading}
                        loadingBtnText={i18n.t(TR.saving)}
                        onPress={handleSave}
                    />
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
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
        marginTop: 20,
        marginBottom: 20,
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
    dangerButtonText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: FontFamily.montserratMedium,
    },
});

export default ProfileSettings;
