import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import OEncounter from "@/components/OEncounter/OEncounter";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { LOCAL_VALUE, saveLocalValue } from "@/services/storage.service";
import { TOURKEY } from "@/services/tourguide.service";
import { API } from "@/utils/api-config";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useTourGuideController } from "rn-tourguide";
import { OTourEncounter } from "../OTourEncounter/OTourEncounter";

interface IOEncounterListProps {
    metStartDateFilter: Date;
    metEndDateFilter: Date;
}

export const OEncounterList = (props: IOEncounterListProps) => {
    const { metStartDateFilter, metEndDateFilter } = props;
    const navigation = useNavigation();
    const { state: encounterState, dispatch } = useEncountersContext();
    const { state: userState } = useUserContext();
    const [refreshing, setRefreshing] = useState(false);

    const fetchEncounters = useCallback(async () => {
        try {
            if (!userState.id) {
                Sentry.captureMessage(
                    `fetchEncounters: UserId undefined. Not making request. User maybe logging out or so?`,
                );
                return;
            }
            setRefreshing(true);
            const encounters =
                await API.encounter.encounterControllerGetEncountersByUser({
                    userId: userState.id,
                    startDate: metStartDateFilter,
                    endDate: metEndDateFilter,
                });

            dispatch({
                type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                payload: encounters,
            });
        } catch (error) {
            console.error(error);
            Sentry.captureException(error, {
                tags: {
                    encounters: "fetch",
                },
            });
        } finally {
            setRefreshing(false);
        }
    }, [userState.id, dispatch, metStartDateFilter, metEndDateFilter]);

    useEffect(() => {
        fetchEncounters();
    }, [fetchEncounters, metStartDateFilter, metEndDateFilter]);

    const onRefresh = useCallback(async () => {
        await fetchEncounters();
    }, [fetchEncounters]);

    const handleTourOnStop = async () => {
        await saveLocalValue(
            LOCAL_VALUE.HAS_DONE_ENCOUNTER_WALKTHROUGH,
            "true",
        );
        dispatch({
            type: EACTION_ENCOUNTERS.SET_IS_WALKTHROUGH_RUNNING,
            payload: false,
        });
    };

    const { stop: stopTourGuide, eventEmitter } = useTourGuideController(
        TOURKEY.ENCOUNTERS,
    );

    useEffect(() => {
        if (!eventEmitter) return;
        eventEmitter?.on("stop", handleTourOnStop);

        return () => {
            eventEmitter?.off("stop", handleTourOnStop);
        };
    }, [eventEmitter, refreshing]);

    const isFocused = useIsFocused();
    useEffect(() => {
        if (!isFocused) {
            stopTourGuide();
        }
    }, [isFocused]);

    const getEncounterList = () => {
        if (encounterState.isWalkthroughRunning) {
            return <OTourEncounter />;
        } else {
            return encounterState.encounters.length > 0 ? (
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
                    <Text style={styles.noEncountersTextLg}>
                        {i18n.t(TR.nobodyWasNearby)}
                    </Text>
                    <Text style={styles.noEncountersTextSm}>
                        {i18n.t(TR.nobodyWasNearbySubtitle)}
                    </Text>
                </View>
            );
        }
    };

    return (
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
            {getEncounterList()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
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
    encounterDropdownPicker: {
        maxWidth: "95%",
        height: 35,
        maxHeight: 35,
        minHeight: 35,
    },
    encountersList: {
        flex: 1,
        height: "100%",
        minHeight: 400,
    },
});
