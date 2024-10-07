import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import {
    EncounterPublicDTOStatusEnum,
    UpdateEncounterStatusDTO,
    UserPrivateDTOApproachChoiceEnum,
} from "@/api/gen/src";
import {
    IOButtonSmallVariant,
    OButtonSmall,
} from "@/components/OButtonSmall/OButtonSmall";
import OMessageModal from "@/components/OMessageModal/OMessageModal";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { TestData } from "@/tests/src/accessors";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { API } from "@/utils/api-config";
import { getTimeLastMet } from "@/utils/date.utils";
import { getValidImgURI } from "@/utils/media.utils";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TouchableOpacity } from "react-native-gesture-handler";

interface ISingleEncounterProps {
    encounterProfile: IEncounterProfile;
    showActions: boolean;
    navigation: any;
}

const OEncounter = (props: ISingleEncounterProps) => {
    const { dispatch } = useEncountersContext();
    const { state } = useUserContext();
    const hookNavigation = useNavigation();
    const { encounterProfile, showActions, navigation } = props;
    const [dateStates] = useState([
        {
            label: i18n.t(TR.encounterInterest.notMet),
            value: EncounterPublicDTOStatusEnum.not_met,
            testID: "dropdown-option-not-met",
        },
        {
            label: i18n.t(TR.encounterInterest.metNotInterested),
            value: EncounterPublicDTOStatusEnum.met_not_interested,
            testID: "dropdown-option-met-not-interested",
        },
        {
            label: i18n.t(TR.encounterInterest.metInterested),
            value: EncounterPublicDTOStatusEnum.met_interested,
            testID: "dropdown-option-met-interested",
        },
    ]);
    const [modalVisible, setModalVisible] = useState(false);

    const setDateStatus = async (item: {
        label: string;
        value: EncounterPublicDTOStatusEnum;
    }) => {
        const updateEncounterStatusDTO: UpdateEncounterStatusDTO = {
            encounterId: encounterProfile.encounterId,
            status: item.value,
        };

        await API.encounter.encounterControllerUpdateStatus({
            updateEncounterStatusDTO,
            userId: state.id!,
        });

        dispatch({
            type: EACTION_ENCOUNTERS.UPDATE_MULTIPLE,
            payload: [
                {
                    encounterId: encounterProfile.encounterId,
                    status: item.value,
                },
            ],
        });
    };
    const dateStatus = encounterProfile.status;

    return (
        <View style={styles.encounterContainer}>
            <View
                style={styles.mainContent}
                onMagicTap={() => console.log("hahahaha")}
            >
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate(ROUTES.Main.ProfileView, {
                            user: encounterProfile,
                        });
                    }}
                >
                    <Image
                        style={styles.profileImage}
                        contentFit="cover"
                        source={{
                            uri: getValidImgURI(encounterProfile.imageURIs[0]),
                        }}
                    />
                </TouchableOpacity>
                <View style={styles.encounterDetails}>
                    <Text
                        style={styles.nameAge}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                    >
                        {`${encounterProfile.firstName}, ${encounterProfile.age}`}
                    </Text>
                    <Text
                        style={styles.encounterInfo}
                    >{`${getTimeLastMet(i18n, TR, encounterProfile.lastTimePassedBy)}`}</Text>

                    {showActions && (
                        <View style={styles.actionContainer}>
                            <View style={styles.dropdownContainer}>
                                <Dropdown
                                    testID={TestData.encounters.inputStatus}
                                    data={dateStates}
                                    labelField="label"
                                    valueField="value"
                                    value={dateStatus}
                                    onChange={setDateStatus}
                                    disable={encounterProfile.reported}
                                    containerStyle={
                                        styles.dropdownContainerStyle
                                    }
                                    style={[
                                        styles.encounterDropdownPicker,
                                        encounterProfile.reported
                                            ? styles.encounterDropdownPickerDisabled
                                            : null,
                                    ]}
                                    placeholderStyle={
                                        styles.dropdownPlaceholderStyle
                                    }
                                    selectedTextStyle={
                                        styles.dropdownSelectedTextStyle
                                    }
                                    itemTextStyle={styles.dropdownItemTextStyle}
                                />
                            </View>
                            <View style={styles.buttonContainer}>
                                {dateStatus ===
                                    EncounterPublicDTOStatusEnum.met_interested && (
                                    <OButtonSmall
                                        label={i18n.t(TR.leaveMessageBtnLbl)}
                                        onPress={() => setModalVisible(true)}
                                        variant={IOButtonSmallVariant.Black}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit={true}
                                    />
                                )}
                                {dateStatus ===
                                    EncounterPublicDTOStatusEnum.met_not_interested && (
                                    <OButtonSmall
                                        isDisabled={encounterProfile.reported}
                                        variant={IOButtonSmallVariant.Danger}
                                        onPress={() =>
                                            navigation.navigate(
                                                ROUTES.Main.ReportEncounter,
                                                {
                                                    personToReport:
                                                        encounterProfile,
                                                },
                                            )
                                        }
                                        label={
                                            encounterProfile.reported
                                                ? i18n.t(TR.reported)
                                                : i18n.t(TR.report)
                                        }
                                        numberOfLines={1}
                                        adjustsFontSizeToFit={true}
                                    />
                                )}
                                {state.approachChoice !==
                                    UserPrivateDTOApproachChoiceEnum.be_approached &&
                                    dateStatus ===
                                        EncounterPublicDTOStatusEnum.not_met &&
                                    encounterProfile.isNearbyRightNow && (
                                        <OButtonSmall
                                            label={i18n.t(TR.navigate)}
                                            numberOfLines={1}
                                            variant={IOButtonSmallVariant.Black}
                                            onPress={() =>
                                                navigation.navigate(
                                                    ROUTES.HouseRules,
                                                    {
                                                        nextPage:
                                                            ROUTES.Main
                                                                .NavigateToApproach,
                                                        propsForNextScreen: {
                                                            navigateToPerson:
                                                                encounterProfile,
                                                        },
                                                    },
                                                )
                                            }
                                            adjustsFontSizeToFit={true}
                                        />
                                    )}
                            </View>
                        </View>
                    )}
                </View>
                {showActions && encounterProfile.rating && (
                    <Text
                        style={styles.trustScore}
                        onPress={() => alert(i18n.t(TR.ratingDescr))}
                    >
                        {i18n.t(TR.trust)}({encounterProfile.rating})
                    </Text>
                )}
            </View>
            <OMessageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                userId={state.id!}
                encounterId={encounterProfile.encounterId}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        marginLeft: 5,
    },
    encounterContainer: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: Color.lightGray,
        paddingBottom: 10,
    },
    mainContent: {
        flexDirection: "row",
        zIndex: 1,
        elevation: 1,
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
    actionContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    dropdownContainer: {
        flex: 1,
        marginRight: 10,
    },
    buttonContainer: {
        width: 100,
        justifyContent: "center",
    },
    encounterDropdownPicker: {
        height: 35,
        borderColor: Color.lightGray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    trustScore: {
        fontFamily: FontFamily.montserratSemiBold,
        position: "absolute",
        top: 0,
        right: 0,
    },

    encounterDropdownContainer: {
        marginTop: 5,
    },
    dropdownContainerStyle: {
        backgroundColor: "white",
        borderRadius: 8,
    },

    encounterDropdownPickerDisabled: {
        backgroundColor: Color.brightGray,
    },
    dropdownPlaceholderStyle: {
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
    },
    dropdownSelectedTextStyle: {
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
    },
    dropdownItemTextStyle: {
        fontSize: FontSize.size_sm,
        fontFamily: FontFamily.montserratRegular,
    },
    receivedMessageContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: Color.lightGray,
        borderRadius: 8,
        padding: 10,
    },
    receivedMessageTitle: {
        fontFamily: FontFamily.montserratSemiBold,
        marginBottom: 5,
    },
    receivedMessageText: {
        fontFamily: FontFamily.montserratRegular,
    },
});

export default OEncounter;
