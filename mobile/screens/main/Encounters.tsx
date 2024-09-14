import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { DateRangeDTO, EncounterApi, MessagePublicDTO } from "@/api/gen/src";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { MainScreenTabsParamList } from "@/screens/main/MainScreenTabs.navigator";
import { ROUTES } from "@/screens/routes";
import { StyledText } from "@/styles/Text.styles";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { includeJWT } from "@/utils/misc.utils";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { useCallback, useState } from "react";
import {
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import OEncounter from "../../components/OEncounter/OEncounter";

const api = new EncounterApi();

const Encounters = ({
    navigation,
}: BottomTabScreenProps<
    MainScreenTabsParamList,
    typeof ROUTES.MainTabView
>) => {
    const { state: encounterState, dispatch } = useEncountersContext();
    const { state: userState } = useUserContext();
    const today = new Date();
    const twoWeeksBefore = new Date();
    twoWeeksBefore.setDate(today.getDate() - 14);
    const [metStartDateFilter, setMetStartDateFilter] =
        useState<Date>(twoWeeksBefore);
    const [metEndDateFilter, setMetEndDateFilter] = useState<Date>(today);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    function sortMessagesByLatest(
        messages: MessagePublicDTO[],
    ): MessagePublicDTO[] {
        return messages.sort(
            (a, b) =>
                new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
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

    const fetchEncounters = useCallback(async () => {
        try {
            const dateRangeDTO: DateRangeDTO = {
                startDate: metStartDateFilter,
                endDate: metEndDateFilter,
            };
            const encounters = await api.encounterControllerGetEncountersByUser(
                {
                    userId: userState.id!,
                    dateRangeDTO,
                },
                await includeJWT(),
            );
            const mappedEncounters: IEncounterProfile[] = [];

            encounters.forEach((encounter) => {
                const otherUser = encounter.users.filter(
                    (u) => u.id !== userState.id,
                )[0];
                mappedEncounters.push({
                    encounterId: encounter.id,
                    firstName: otherUser.firstName,
                    age: otherUser.age,
                    bio: otherUser.bio,
                    imageURIs: otherUser.imageURIs,
                    isNearbyRightNow: encounter.isNearbyRightNow,
                    status: encounter.status,
                    reported: encounter.reported,
                    lastLocationPassedBy: encounter.lastLocationPassedBy ?? "",
                    lastTimePassedBy: encounter.lastDateTimePassedBy,
                    rating: otherUser.trustScore,
                    lastReceivedMessage: findLatestReceivedMessage(
                        encounter.messages,
                        otherUser.id,
                    ),
                });
            });

            dispatch({
                type: EACTION_ENCOUNTERS.UPDATE_MULTIPLE,
                payload: mappedEncounters,
            });
        } catch (error) {
            console.error(error);
        }
    }, [userState.id, userState.jwtAccessToken, dispatch]);

    React.useEffect(() => {
        fetchEncounters();
    }, [fetchEncounters]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchEncounters();
        setRefreshing(false);
    }, [fetchEncounters]);

    const onMetStartDateFilterChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setMetStartDateFilter(selectedDate);
        }
    };

    const onMetEndDateFilterChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setMetEndDateFilter(selectedDate);
        }
    };

    const renderContent = () => (
        <ScrollView
            style={styles.encountersList}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={
                encounterState.encounters.length === 0 &&
                styles.emptyListContainer
            }
        >
            {encounterState.encounters.length > 0 ? (
                encounterState.encounters.map((encounter, idx) => (
                    <OEncounter
                        key={idx}
                        encounterProfile={encounter}
                        showActions={true}
                        navigation={navigation}
                    />
                ))
            ) : (
                <View style={styles.noEncountersContainer}>
                    <StyledText.Large>Nobody was nearby..</StyledText.Large>
                    <StyledText.Medium>
                        (hint: mingle with the crowd)
                    </StyledText.Medium>
                </View>
            )}
        </ScrollView>
    );

    return (
        <OPageContainer
            subtitle={i18n.t(TR.peopleYouMightHaveMet)}
            doNotUseScrollView={true}
        >
            <View style={styles.container}>
                <View style={styles.dateRangeContainer}>
                    <View style={styles.dateContainer}>
                        <StyledText.Medium>From</StyledText.Medium>
                        {Platform.OS === "ios" ? (
                            <RNDateTimePicker
                                display="default"
                                mode="date"
                                style={styles.iosDatePicker}
                                onChange={onMetStartDateFilterChange}
                                accessibilityLabel={i18n.t(TR.weMetFrom)}
                                value={metStartDateFilter}
                            />
                        ) : (
                            <>
                                <TouchableOpacity
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <StyledText.Medium>
                                        {metStartDateFilter.toDateString()}
                                    </StyledText.Medium>
                                </TouchableOpacity>
                                {showStartDatePicker && (
                                    <RNDateTimePicker
                                        value={metStartDateFilter}
                                        mode="date"
                                        display="default"
                                        onChange={onMetStartDateFilterChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                    <View style={styles.dateContainer}>
                        <StyledText.Medium>To</StyledText.Medium>
                        {Platform.OS === "ios" ? (
                            <RNDateTimePicker
                                display="default"
                                mode="date"
                                style={styles.iosDatePicker}
                                onChange={onMetEndDateFilterChange}
                                accessibilityLabel={i18n.t(TR.toThisDate)}
                                value={metEndDateFilter}
                            />
                        ) : (
                            <>
                                <TouchableOpacity
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <StyledText.Medium
                                        style={styles.androidDateButton}
                                    >
                                        {metEndDateFilter.toDateString()}
                                    </StyledText.Medium>
                                </TouchableOpacity>
                                {showEndDatePicker && (
                                    <RNDateTimePicker
                                        value={metEndDateFilter}
                                        mode="date"
                                        display="default"
                                        onChange={onMetEndDateFilterChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>

                {renderContent()}
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    iosDatePicker: { marginLeft: -10 },
    androidDateButton: {
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratRegular,
        color: Color.black,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Color.lightGray,
        borderRadius: 5,
    },
    noEncountersContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noEncountersTextLg: {
        fontFamily: FontFamily.montserratMedium,
        fontSize: FontSize.size_md,
        color: Color.gray,
    },
    noEncountersTextSm: {
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_sm,
        color: Color.gray,
    },
    container: {
        flex: 1,
    },
    encounterDropdownPicker: {
        maxWidth: "95%",
        height: 35,
        maxHeight: 35,
        minHeight: 35,
    },
    dateRangeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    dateContainer: {
        flex: 1,
        alignItems: "flex-start",
    },
    dateLabel: {
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratMedium,
        color: Color.gray,
        marginBottom: 5,
    },
    encountersList: {
        flex: 1,
        height: "100%",
        minHeight: 400,
    },
});

export default Encounters;
