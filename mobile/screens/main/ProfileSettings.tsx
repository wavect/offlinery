import { FontFamily, FontSize } from "@/GlobalStyles";
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
import { StyledMaterialIcon } from "@/styles/Icon.styles";
import { SText } from "@/styles/Text.styles";
import { includeJWT } from "@/utils/misc.utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
                    <StyledMaterialIcon
                        name={icon}
                        size={30}
                        color="#000"
                        noMargin
                    />
                    <SText.XSmall center bold>
                        {text}
                    </SText.XSmall>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <OPageContainer subtitle={i18n.t(TR.changePreferencesDescr)}>
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <SText.Small>{i18n.t(TR.myFirstNameIs)}</SText.Small>
                    <OTextInput
                        value={state.firstName}
                        onChangeText={setFirstName}
                        placeholder={i18n.t(TR.enterFirstName)}
                    />
                </View>

                {state.approachChoice !== UserApproachChoiceEnum.approach && (
                    <View style={styles.timePickerContainer}>
                        <SText.Small>
                            {i18n.t(TR.approachMeBetween)}
                        </SText.Small>
                        <View style={styles.timePickerRow}>
                            <View style={styles.timePicker}>
                                <SText.Small>{i18n.t(TR.from)}</SText.Small>
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
                                <SText.Small>{i18n.t(TR.until)}</SText.Small>
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
                    <SText.Small>{i18n.t(TR.bio)}</SText.Small>
                    <OTextInput
                        value={state.bio}
                        onChangeText={setBio}
                        placeholder={i18n.t(TR.noPickUpLinesBeChill)}
                        multiline={true}
                    />
                </View>

                <View style={styles.datePickerContainer}>
                    <SText.Small>{i18n.t(TR.myBirthDayIs)}</SText.Small>
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
                    <SText.Small>{i18n.t(TR.iAmA)}</SText.Small>
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
                    <SText.Medium>{i18n.t(TR.iLookFor)}</SText.Medium>
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
                <View style={styles.buttonContainer}>
                    <OButtonWide
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
});

export default ProfileSettings;
