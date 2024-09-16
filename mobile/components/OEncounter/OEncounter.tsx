import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import {
    EncounterApi,
    EncounterPublicDTOStatusEnum,
    UpdateEncounterStatusDTO,
    UserApproachChoiceEnum,
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
import { IEncounterProfile } from "@/types/PublicProfile.types";
import * as React from "react";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface ISingleEncounterProps {
    encounterProfile: IEncounterProfile;
    showActions: boolean;
    navigation: any;
}

const encounterApi = new EncounterApi();
const OEncounter = (props: ISingleEncounterProps) => {
    const { dispatch } = useEncountersContext();
    const { dispatch: userDispatch, state } = useUserContext();
    const { encounterProfile, showActions, navigation } = props;
    const [dateStates] = useState([
        {
            label: i18n.t(TR.encounterInterest.notMet),
            value: EncounterPublicDTOStatusEnum.not_met,
        },
        {
            label: i18n.t(TR.encounterInterest.metNotInterested),
            value: EncounterPublicDTOStatusEnum.met_not_interested,
        },
        {
            label: i18n.t(TR.encounterInterest.metInterested),
            value: EncounterPublicDTOStatusEnum.met_interested,
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

        await encounterApi.encounterControllerUpdateStatus({
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
            <View style={styles.mainContent}>
                <Image
                    style={styles.profileImage}
                    contentFit="cover"
                    source={{ uri: encounterProfile.imageURIs[0] }}
                />
                <View style={styles.encounterDetails}>
                    <Text
                        style={styles.nameAge}
                    >{`${encounterProfile.firstName}, ${encounterProfile.age}`}</Text>
                    <Text
                        style={styles.encounterInfo}
                    >{`${encounterProfile.lastTimePassedBy} near ${encounterProfile.lastLocationPassedBy}`}</Text>

                    {showActions && (
                        <View style={styles.encounterDropdownContainer}>
                            <Dropdown
                                data={dateStates}
                                labelField="label"
                                valueField="value"
                                value={dateStatus}
                                onChange={setDateStatus}
                                disable={encounterProfile.reported}
                                containerStyle={styles.dropdownContainerStyle}
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
                    )}
                </View>
                {showActions && (
                    <View style={styles.rightColumn}>
                        {encounterProfile.rating && (
                            <Text
                                style={styles.trustScore}
                                onPress={() => alert(i18n.t(TR.ratingDescr))}
                            >
                                {i18n.t(TR.trust)}({encounterProfile.rating})
                            </Text>
                        )}
                        {dateStatus ===
                            EncounterPublicDTOStatusEnum.met_interested && (
                            <OButtonSmall
                                label={i18n.t(TR.leaveMessageBtnLbl)}
                                containerStyle={styles.button}
                                onPress={() => setModalVisible(true)}
                                variant={IOButtonSmallVariant.Black}
                            />
                        )}
                        {dateStatus ===
                            EncounterPublicDTOStatusEnum.met_not_interested && (
                            <OButtonSmall
                                isDisabled={encounterProfile.reported}
                                variant={IOButtonSmallVariant.Danger}
                                containerStyle={styles.button}
                                onPress={() =>
                                    navigation.navigate(
                                        ROUTES.Main.ReportEncounter,
                                        {
                                            personToReport: encounterProfile,
                                        },
                                    )
                                }
                                label={
                                    encounterProfile.reported
                                        ? i18n.t(TR.reported)
                                        : i18n.t(TR.report)
                                }
                            />
                        )}

                        {state.approachChoice !==
                            UserApproachChoiceEnum.be_approached &&
                            dateStatus ===
                                EncounterPublicDTOStatusEnum.not_met &&
                            encounterProfile.isNearbyRightNow && (
                                <OButtonSmall
                                    label={i18n.t(TR.navigate)}
                                    variant={IOButtonSmallVariant.Black}
                                    containerStyle={styles.button}
                                    onPress={() =>
                                        navigation.navigate(ROUTES.HouseRules, {
                                            nextPage:
                                                ROUTES.Main.NavigateToApproach,
                                            propsForNextScreen: {
                                                navigateToPerson:
                                                    encounterProfile,
                                            },
                                        })
                                    }
                                />
                            )}
                    </View>
                )}
            </View>

            {dateStatus === EncounterPublicDTOStatusEnum.met_interested &&
                encounterProfile.lastReceivedMessage && (
                    <View style={styles.receivedMessageContainer}>
                        <Text style={styles.receivedMessageTitle}>
                            {i18n.t(TR.receivedMessage)}:
                        </Text>
                        <Text style={styles.receivedMessageText}>
                            {encounterProfile.lastReceivedMessage.content}
                        </Text>
                    </View>
                )}

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
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    trustScore: {
        fontFamily: FontFamily.montserratSemiBold,
    },
    encounterDropdownContainer: {
        marginTop: 5,
    },
    dropdownContainerStyle: {
        backgroundColor: "white",
        borderRadius: 8,
    },
    encounterDropdownPicker: {
        height: 35,
        borderColor: Color.lightGray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
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
