import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import {
    EncounterPublicDTO,
    EncounterPublicDTOStatusEnum,
    MessagePublicDTO,
    UpdateEncounterStatusDTO,
    UserPrivateDTOApproachChoiceEnum,
} from "@/api/gen/src";
import { OBadgesOfUser } from "@/components/OBadge/OBadgesOfUser";
import {
    IOButtonSmallVariant,
    OButtonSmall,
} from "@/components/OButtonSmall/OButtonSmall";
import { OEncounterStrike } from "@/components/OEncounterStrike/OEncounterStrike";
import OMessageModal from "@/components/OMessageModal/OMessageModal";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import { MOCK_ENCOUNTER, TOURKEY } from "@/services/tourguide.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import { getTimePassedWithText } from "@/utils/date.utils";
import { getValidImgURI } from "@/utils/media.utils";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TouchableOpacity } from "react-native-gesture-handler";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";

interface ISingleEncounterProps {
    encounterProfile: EncounterPublicDTO;
    showActions: boolean;
    navigation: any;
}

function sortMessagesByLatest(
    messages: MessagePublicDTO[],
): MessagePublicDTO[] {
    return messages.sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
    );
}

function findLatestReceivedMessage(
    messages: MessagePublicDTO[] | null,
    otherUserId: string,
): MessagePublicDTO | undefined {
    if (!messages || !messages.length) {
        return;
    }
    return sortMessagesByLatest(messages).find(
        (m) => m.senderUserId === otherUserId,
    );
}

const OEncounter = (props: ISingleEncounterProps) => {
    // @dev Here to be re-rendered for storybook localization
    const dateStateConfig = [
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
    ];

    const { dispatch } = useEncountersContext();
    const { state } = useUserContext();
    const { encounterProfile, showActions, navigation } = props;
    const [modalVisible, setModalVisible] = useState(false);

    const setDateStatus = async (item: {
        label: string;
        value: EncounterPublicDTOStatusEnum;
    }) => {
        const updateEncounterStatusDTO: UpdateEncounterStatusDTO = {
            encounterId: encounterProfile.id,
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
                    id: encounterProfile.id,
                    status: item.value,
                },
            ],
        });
    };
    const dateStatus = encounterProfile.status;
    const lastMessage = findLatestReceivedMessage(
        encounterProfile.messages,
        encounterProfile.otherUser.id,
    );

    const handleTourOnStepChange = (e: any) => {
        if (e?.order === 2) {
            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: [MOCK_ENCOUNTER({ status: "met_interested" })],
            });
        } else if (e?.order === 3) {
            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: [
                    MOCK_ENCOUNTER({
                        status: "met_interested",
                        messages: [
                            {
                                id: "44",
                                content:
                                    "Forgot to drop my number :), +43 xxxxxxx",
                                senderUserId: "abc",
                                sentAt: new Date().toISOString(),
                            },
                        ],
                    }),
                ],
            });
        } else if (e?.order === 4) {
            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: [MOCK_ENCOUNTER({ status: "met_not_interested" })],
            });
        } else if (e?.order === 5) {
            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: [MOCK_ENCOUNTER({ status: "not_met" })],
            });
        } else if (e?.order === 6) {
            // @dev revert to order4 state "previous" button would otherwise keep the 7th state.
            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: [MOCK_ENCOUNTER({ status: "not_met" })],
            });
        } else if (e?.order === 7) {
            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: [
                    MOCK_ENCOUNTER({
                        status: "met_interested",
                        isNearbyRightNow: true,
                    }),
                ],
            });
        }
    };

    const { tourKey, eventEmitter, stop } = useTourGuideController(
        TOURKEY.ENCOUNTERS,
    );

    useEffect(() => {
        if (!eventEmitter) return;
        eventEmitter?.on("stepChange", handleTourOnStepChange);

        return () => {
            eventEmitter?.off("stepChange", handleTourOnStepChange);
        };
        // @dev Keep mapRegion in dependency to mock heatmap along current mapRegion
    }, [eventEmitter]);

    return (
        <TourGuideZone
            zone={1}
            tourKey={tourKey}
            text={i18n.t(TR.tourEncounters)}
            shape="rectangle"
        >
            <View style={styles.encounterContainer}>
                <View style={styles.mainContent}>
                    <TouchableOpacity
                        onPress={() => {
                            stop(); // @dev Stop tourguide when screen changes.
                            navigation.navigate(ROUTES.Main.ProfileView, {
                                user: encounterProfile.otherUser,
                            });
                        }}
                    >
                        <Image
                            style={styles.profileImage}
                            contentFit="cover"
                            source={{
                                uri: getValidImgURI(
                                    encounterProfile.otherUser.imageURIs[0],
                                ),
                            }}
                        />
                    </TouchableOpacity>
                    <View style={styles.encounterDetails}>
                        <View style={styles.metadataContainer}>
                            <Text
                                style={styles.nameAge}
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}
                            >
                                {`${encounterProfile.otherUser.firstName}, ${encounterProfile.otherUser.age}`}
                            </Text>
                            <TourGuideZone
                                zone={5}
                                tourKey={tourKey}
                                style={{ maxWidth: "75%" }}
                                text={i18n.t(TR.tourEncounterIntentions)}
                                shape="rectangle"
                            >
                                <OBadgesOfUser
                                    intentions={
                                        encounterProfile.otherUser.intentions
                                    }
                                    hideLabel={true}
                                />
                            </TourGuideZone>
                            <View style={styles.strikeWrapper}>
                                <TourGuideZone
                                    zone={7}
                                    tourKey={tourKey}
                                    text={i18n.t(TR.tourEncounterNearbyNow)}
                                    style={{ minHeight: 75 }}
                                    shape="circle"
                                >
                                    <TourGuideZone
                                        zone={6}
                                        tourKey={tourKey}
                                        text={i18n.t(TR.tourEncounterStrike)}
                                        style={{ minHeight: 20 }}
                                        shape="circle"
                                    >
                                        {encounterProfile.status !==
                                            EncounterPublicDTOStatusEnum.met_not_interested && (
                                            <OEncounterStrike
                                                amountStreaks={
                                                    encounterProfile.amountStreaks
                                                }
                                                isNearbyRightNow={
                                                    encounterProfile.isNearbyRightNow ||
                                                    false
                                                }
                                            />
                                        )}
                                    </TourGuideZone>
                                </TourGuideZone>
                            </View>
                        </View>
                        <Text style={styles.encounterInfo}>
                            <MaterialIcons name="schedule" />
                            &nbsp;
                            {`${getTimePassedWithText(encounterProfile.lastDateTimePassedBy)}`}
                        </Text>
                    </View>
                </View>

                <TourGuideZone
                    zone={3}
                    tourKey={tourKey}
                    text={i18n.t(TR.tourEncounterMessage)}
                    shape="rectangle"
                >
                    {showActions && (
                        <TourGuideZone
                            zone={4}
                            tourKey={tourKey}
                            text={i18n.t(TR.tourEncounterNotInterested)}
                            shape="rectangle"
                        >
                            <View style={styles.actionContainer}>
                                <View style={styles.dropdownContainer}>
                                    <TourGuideZone
                                        zone={2}
                                        tourKey={tourKey}
                                        text={i18n.t(
                                            TR.tourEncounterInterested,
                                        )}
                                        shape="rectangle"
                                    >
                                        <Dropdown
                                            testID={
                                                TestData.encounters.inputStatus
                                            }
                                            data={dateStateConfig}
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
                                            itemTextStyle={
                                                styles.dropdownItemTextStyle
                                            }
                                        />
                                    </TourGuideZone>
                                </View>
                                <View style={styles.buttonContainer}>
                                    {!encounterProfile.isNearbyRightNow &&
                                        dateStatus ===
                                            EncounterPublicDTOStatusEnum.met_interested && (
                                            <OButtonSmall
                                                label={i18n.t(
                                                    TR.leaveMessageBtnLbl,
                                                )}
                                                onPress={() =>
                                                    setModalVisible(true)
                                                }
                                                variant={
                                                    IOButtonSmallVariant.Primary
                                                }
                                                numberOfLines={1}
                                                adjustsFontSizeToFit={true}
                                            />
                                        )}

                                    {dateStatus ===
                                        EncounterPublicDTOStatusEnum.met_not_interested && (
                                        <OButtonSmall
                                            isDisabled={
                                                encounterProfile.reported
                                            }
                                            variant={
                                                IOButtonSmallVariant.Danger
                                            }
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
                                        dateStatus !==
                                            EncounterPublicDTOStatusEnum.met_not_interested &&
                                        encounterProfile.isNearbyRightNow && (
                                            <OButtonSmall
                                                label={i18n.t(TR.navigate)}
                                                numberOfLines={1}
                                                variant={
                                                    IOButtonSmallVariant.Black
                                                }
                                                onPress={() =>
                                                    navigation.navigate(
                                                        ROUTES.HouseRules,
                                                        {
                                                            nextPage:
                                                                ROUTES.Main
                                                                    .NavigateToApproach,
                                                            propsForNextScreen:
                                                                {
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
                        </TourGuideZone>
                    )}

                    {dateStatus ===
                        EncounterPublicDTOStatusEnum.met_interested &&
                        lastMessage && (
                            <View style={styles.receivedMessageContainer}>
                                <Text style={styles.receivedMessageTitle}>
                                    {i18n.t(TR.receivedMessage)}:
                                </Text>
                                <Text style={styles.receivedMessageText}>
                                    {lastMessage.content}
                                </Text>
                            </View>
                        )}
                </TourGuideZone>
                <OMessageModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    userId={state.id!}
                    encounterId={encounterProfile.id}
                />
            </View>
        </TourGuideZone>
    );
};

const styles = StyleSheet.create({
    button: {
        marginLeft: 5,
    },
    metadataContainer: {
        position: "relative",
        width: "100%",
    },
    strikeWrapper: {
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 1,
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
        marginTop: 10,
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
