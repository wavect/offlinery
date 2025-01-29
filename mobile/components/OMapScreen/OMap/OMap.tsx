import { BorderRadius, Color, FontSize } from "@/GlobalStyles";
import { UserPrivateDTODateModeEnum } from "@/api/gen/src";
import { OBlacklistedRegion } from "@/components/OBlacklistedRegion/OBlacklistedRegion";
import { OHeatMap } from "@/components/OMapScreen/OHeatMap/OHeatMap";
import {
    EMapStatus,
    OMapStatus,
} from "@/components/OMapScreen/OMapStatus/OMapStatus";
import { OSafeZoneSliderCard } from "@/components/OMapScreen/OSafeZoneSliderCard/OSafeZoneSliderCard";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import {
    EACTION_USER,
    MapRegion,
    mapRegionToBlacklistedRegionDTO,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { LOCAL_VALUE, saveLocalValue } from "@/services/storage.service";
import { TOURKEY } from "@/services/tourguide.service";
import { API } from "@/utils/api-config";
import { get3MonthsBefore } from "@/utils/date.utils";
import { getMapProvider } from "@/utils/map-provider";
import { useIsFocused } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import debounce from "lodash.debounce";
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import MapView, { LongPressEvent, Marker, Region } from "react-native-maps";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";

interface OMapProps {
    saveChangesToBackend: boolean;
    showHeatmap: boolean;
    showEncounters: boolean;
    showBlacklistedRegions: boolean;
    showMapStatus: boolean;
}

const DEFAULT_RADIUS_SIZE = 250;

export const OMap = memo(
    ({
        saveChangesToBackend,
        showHeatmap,
        showBlacklistedRegions,
        showMapStatus,
        showEncounters,
    }: OMapProps) => {
        const [mapStatus, setMapStatus] = useState<EMapStatus | null>(null);
        const { state, dispatch } = useUserContext();
        const { state: encounterState, dispatch: encounterDispatch } =
            useEncountersContext();
        const [isSavingSafeZones, setSavingSafeZones] = useState(false);
        const [isHeatMapLoading, setLoadingHeatMap] = useState(false);
        const [isEncountersLoading, setEncountersLoading] = useState(false);
        const [activeRegionIndex, setActiveRegionIndex] = useState<
            number | null
        >(null);
        const prevBlacklistedRegionsRef = useRef<MapRegion[]>([]);
        const [mapRegion, setMapRegion] = useState<Region>({
            latitude: 47.257832302,
            longitude: 11.383665132,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
        });
        /** @DEV use a temp value here, so we do not update and re-use the same value (lagging) */
        const [tempSliderValue, setTempSliderValue] =
            useState(DEFAULT_RADIUS_SIZE);

        useEffect(() => {
            // @dev Keep error showing
            if (mapStatus === EMapStatus.ERROR) return;
            else if (isSavingSafeZones) {
                setMapStatus(EMapStatus.SAVING_SAFEZONES);
            } else if (isHeatMapLoading) {
                setMapStatus(EMapStatus.LOADING_HEATMAP);
            } else if (isEncountersLoading) {
                setMapStatus(EMapStatus.LOADING_ENCOUNTERS);
            } else {
                setMapStatus(
                    state.dateMode === UserPrivateDTODateModeEnum.live
                        ? EMapStatus.LIVE
                        : EMapStatus.GHOST,
                );
            }
        }, [
            state.dateMode,
            isSavingSafeZones,
            isEncountersLoading,
            isHeatMapLoading,
        ]);

        const fetchEncounters = useCallback(async () => {
            try {
                if (!showEncounters) return;
                if (!state.id) {
                    Sentry.captureMessage(
                        `fetchEncounters (OMap): UserId undefined. Not making request. User maybe logging out or so?`,
                    );
                    return;
                }
                setEncountersLoading(true);

                const encounters =
                    await API.encounter.encounterControllerGetEncountersByUser({
                        userId: state.id,
                        startDate: get3MonthsBefore(),
                        endDate: new Date(),
                    });

                encounterDispatch({
                    type: EACTION_ENCOUNTERS.PUSH_MULTIPLE,
                    payload: encounters,
                });
            } catch (error) {
                console.error(error);
                Sentry.captureException(error, {
                    tags: {
                        encountersOMap: "fetch",
                    },
                });
            } finally {
                setEncountersLoading(false);
            }
        }, [state.id, encounterDispatch, showEncounters]);

        const onLoadingStateChange = useCallback(
            (isLoading: boolean) => {
                if (!showMapStatus) return;
                setLoadingHeatMap(isLoading);
            },
            [showMapStatus],
        );

        useEffect(() => {
            fetchEncounters();
        }, []);

        const setBlacklistedRegions = useCallback(
            (blacklistedRegions: MapRegion[]) => {
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: { blacklistedRegions },
                });
            },
            [],
        );

        const handleMapLongPress = useCallback(
            (event: LongPressEvent) => {
                const { coordinate } = event.nativeEvent;
                const { latitude, longitude } = coordinate;

                setBlacklistedRegions([
                    ...state.blacklistedRegions,
                    { latitude, longitude, radius: DEFAULT_RADIUS_SIZE },
                ]);
                setActiveRegionIndex(state.blacklistedRegions.length);
            },
            [state.blacklistedRegions],
        );

        const handleRegionPress = useCallback((index: number) => {
            const region = state.blacklistedRegions.find((r, i) => i === index);
            setActiveRegionIndex(index);
            setTempSliderValue(region?.radius ?? DEFAULT_RADIUS_SIZE);
        }, []);

        const handleRemoveRegion = useCallback(() => {
            const newRegions = state.blacklistedRegions.filter(
                (_, i) => i !== activeRegionIndex,
            );
            setBlacklistedRegions(newRegions);
            setActiveRegionIndex(null);
        }, [state.blacklistedRegions, activeRegionIndex]);

        const handleRadiusChange = (value: number) => {
            if (activeRegionIndex !== null) {
                const newRegions = [...state.blacklistedRegions];
                newRegions[activeRegionIndex] = {
                    ...newRegions[activeRegionIndex],
                    radius: value,
                };
                setBlacklistedRegions(newRegions);
            }
        };

        const debouncedSave = useMemo(
            () =>
                debounce(async (regions) => {
                    if (!saveChangesToBackend) return;
                    try {
                        setSavingSafeZones(true);

                        await API.user.userControllerUpdateUser({
                            userId: state.id!,
                            updateUserDTO: {
                                blacklistedRegions: regions.map(
                                    mapRegionToBlacklistedRegionDTO,
                                ),
                            },
                        });
                    } catch (err) {
                        Sentry.captureException(err, {
                            tags: { omap: "debouncedSave" },
                        });
                        setMapStatus(EMapStatus.ERROR);
                    } finally {
                        setSavingSafeZones(false);
                    }
                }, 1000),
            [saveChangesToBackend, state.id, state.dateMode],
        );

        useEffect(() => {
            if (!saveChangesToBackend) return;

            if (
                state.blacklistedRegions !== prevBlacklistedRegionsRef.current
            ) {
                debouncedSave(state.blacklistedRegions);
                prevBlacklistedRegionsRef.current = state.blacklistedRegions;
            }

            return () => {
                debouncedSave.cancel();
                // Ensure we reset the saving flag if the component unmounts while saving
                setSavingSafeZones(false);
            };
        }, [state.blacklistedRegions, state.id, state.dateMode, showMapStatus]);

        const handleMapPress = useCallback(() => {
            activeRegionIndex !== null && setActiveRegionIndex(null);
        }, [activeRegionIndex]);

        const { eventEmitter, stop: stopTourGuide } = useTourGuideController(
            TOURKEY.FIND,
        );

        const handleTourOnStop = async (e: any) => {
            // @dev Save that tutorial done, to not show again except user clicked help btn
            await saveLocalValue(LOCAL_VALUE.HAS_DONE_FIND_WALKTHROUGH, "true");
        };
        const handleTourOnStepChange = (e: any) => {
            if (e?.order === 3) {
                // @dev add example blacklisted region if none added yet
                if (!state.blacklistedRegions.length) {
                    setBlacklistedRegions([
                        ...state.blacklistedRegions,
                        {
                            latitude: mapRegion.latitude * 0.9999,
                            longitude: mapRegion.longitude * 0.9999,
                            radius: DEFAULT_RADIUS_SIZE,
                        },
                    ]);
                }
                setActiveRegionIndex(0);
            }
        };
        useEffect(() => {
            if (!eventEmitter) return;
            eventEmitter?.on("stop", handleTourOnStop);
            eventEmitter?.on("stepChange", handleTourOnStepChange);

            return () => {
                eventEmitter?.off("stop", handleTourOnStop);
                eventEmitter?.off("stepChange", handleTourOnStepChange);
            };
            // @dev Keep mapRegion in dependency to mock heatmap along current mapRegion
        }, [eventEmitter, mapRegion]);

        const isFocused = useIsFocused();
        useEffect(() => {
            if (!isFocused) {
                stopTourGuide();
            }
        }, [isFocused]);

        const renderedEncounterPins = useMemo(() => {
            return (
                <>
                    {encounterState.encounters.map((e) => {
                        if (!e.lastLocationPassedBy) return;
                        return (
                            <Marker
                                key={e.otherUser.id}
                                coordinate={e.lastLocationPassedBy}
                                title={e.otherUser.firstName}
                                pinColor={Color.primary}
                                description={i18n.t(TR.youMetHere)}
                                draggable={false}
                                tracksViewChanges={false}
                            />
                        );
                    })}
                </>
            );
        }, [encounterState.encounters]);

        const renderedBlacklistedRegions = useMemo(() => {
            return (
                <>
                    {state.blacklistedRegions.map((region, index) => {
                        return (
                            <OBlacklistedRegion
                                key={`region-${index}`}
                                handleRegionPress={() =>
                                    handleRegionPress(index)
                                }
                                region={region}
                                isSelected={index === activeRegionIndex}
                            />
                        );
                    })}
                </>
            );
        }, [state.blacklistedRegions, activeRegionIndex, handleRegionPress]);

        const MapViewMemo = useMemo(
            () => (
                <MapView
                    style={styles.map}
                    region={mapRegion}
                    initialRegion={mapRegion}
                    showsMyLocationButton
                    showsUserLocation
                    zoomControlEnabled
                    zoomEnabled
                    zoomTapEnabled
                    maxZoomLevel={15}
                    onPress={handleMapPress}
                    onLongPress={
                        showBlacklistedRegions ? handleMapLongPress : undefined
                    }
                    provider={getMapProvider()}
                >
                    <OHeatMap
                        showMap={showHeatmap}
                        onLoadingStateChange={onLoadingStateChange}
                        currentMapRegion={mapRegion}
                        userId={state.id}
                        datingMode={state.dateMode}
                    />
                    {showBlacklistedRegions && renderedBlacklistedRegions}
                    {showEncounters && renderedEncounterPins}
                </MapView>
            ),
            [
                mapRegion.longitude,
                mapRegion.latitude,
                handleMapPress,
                handleMapLongPress,
                showBlacklistedRegions,
                showHeatmap,
                state.id,
                state.dateMode,
                renderedBlacklistedRegions,
            ],
        );

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={handleMapPress}>
                    <TourGuideZone
                        zone={3}
                        tourKey={TOURKEY.FIND}
                        text={i18n.t(TR.tourSafeZones)}
                        tooltipBottomOffset={-200}
                        shape="rectangle"
                    >
                        <TourGuideZone
                            zone={2}
                            tourKey={TOURKEY.FIND}
                            text={i18n.t(TR.tourHeatMap)}
                            tooltipBottomOffset={-200}
                            shape="rectangle"
                        >
                            <View style={styles.mapContainer}>
                                {MapViewMemo}
                            </View>
                        </TourGuideZone>
                    </TourGuideZone>
                </TouchableWithoutFeedback>

                {showMapStatus && mapStatus && (
                    <View style={styles.mapStatusContainer}>
                        <OMapStatus status={mapStatus} />
                    </View>
                )}

                {showBlacklistedRegions && activeRegionIndex !== null && (
                    <OSafeZoneSliderCard
                        handleRadiusChange={handleRadiusChange}
                        handleRemoveRegion={handleRemoveRegion}
                        activeRegionIndex={activeRegionIndex}
                        sliderValue={tempSliderValue}
                    />
                )}
            </View>
        );
    },
);

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    mapStatusContainer: {
        position: "absolute",
        left: 4,
        bottom: Platform.OS === "ios" ? -10 : 4,
        zIndex: 1,
    },
    mapContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
        position: "relative",
        minHeight: height * 0.75,
    },
    map: {
        minHeight: 400,
        borderRadius: BorderRadius.br_5xs,
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: Color.white,
    },
    sliderOverlayContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
    },
    sliderSafeArea: {
        width: "100%",
    },
    sliderWrapper: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    controlsCard: {
        padding: 16,
    },
    androidControlsCard: {
        elevation: 8,
        marginBottom: 12,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
    },
    controlsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sliderText: {
        fontSize: FontSize.size_md,
        flex: 1,
        marginRight: 16,
    },
    sliderContainer: {
        paddingVertical: Platform.OS === "android" ? 8 : 0,
    },
    slider: {
        width: "100%",
    },
    androidSlider: {
        height: 40,
    },
    instructions: {
        marginTop: 20,
    },
    instructionText: {
        marginBottom: 5,
        fontSize: FontSize.size_sm,
    },
    overlay: {
        position: "absolute",
        top: height / 1.5,
        left: 0,
        right: 0,
        zIndex: 1,
    },
});
