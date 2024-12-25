import { BorderRadius, Color, FontSize, Subtitle } from "@/GlobalStyles";
import { OFloatingActionButton } from "@/components/OFloatingActionButton/OFloatingActionButton";
import { OHeatMap } from "@/components/OHeatMap/OHeatMap";
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
import { getMapProvider } from "@/utils/map-provider";
import Slider from "@react-native-community/slider";
import { useIsFocused } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import BackgroundGeolocation, {
    Location,
} from "react-native-background-geolocation";
import MapView, {
    Circle,
    LongPressEvent,
    Marker,
    MarkerDragStartEndEvent,
    Region,
} from "react-native-maps";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";

interface OMapProps {
    saveChangesToBackend: boolean;
    showHeatmap: boolean;
    showBlacklistedRegions: boolean;
}

const DEFAULT_RADIUS_SIZE = 1000;

export const OMap = (props: OMapProps) => {
    const [forceRerender, triggerForceRerender] = useState<number>(0);
    const { saveChangesToBackend, showHeatmap, showBlacklistedRegions } = props;
    const { state, dispatch } = useUserContext();
    const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(
        null,
    );
    const [location, setLocation] = useState<Location | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const prevBlacklistedRegionsRef = useRef<MapRegion[]>([]);
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: 47.257832302,
        longitude: 11.383665132,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    /** @DEV use a temp value here, so we do not update and re-use the same value (lagging) */
    const [tempSliderValue, setTempSliderValue] = useState(0);

    useEffect(() => {
        (async () => {
            await getUserPosition();
        })();
    }, []);

    useEffect(() => {
        if (location) {
            setMapRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
    }, [location]);

    const getUserPosition = async () => {
        try {
            const location = await BackgroundGeolocation.getCurrentPosition({
                desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
            });
            setLocation(location);
        } catch (error) {
            console.error("Unable to get user location.", error);
            Sentry.captureException(error, {
                tags: {
                    map: "location",
                },
            });
        }
    };

    const setBlacklistedRegions = useCallback(
        (blacklistedRegions: MapRegion[]) => {
            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { blacklistedRegions },
            });
        },
        [dispatch],
    );

    const handleMapLongPress = useCallback(
        (event: LongPressEvent) => {
            const { coordinate } = event.nativeEvent;
            const { latitude, longitude } = coordinate;
            setBlacklistedRegions([
                ...state.blacklistedRegions,
                { latitude, longitude, radius: DEFAULT_RADIUS_SIZE },
            ]);
        },
        [state.blacklistedRegions, setBlacklistedRegions],
    );

    const handleRegionPress = useCallback((index: number) => {
        setActiveRegionIndex(index);
        const mapRegion = state.blacklistedRegions.find(
            (blacklistedRegin, ind) => ind === index,
        );
        setTempSliderValue(mapRegion?.radius ?? DEFAULT_RADIUS_SIZE);
    }, []);

    const handleRemoveRegion = useCallback(
        (index: number) => {
            const newRegions = state.blacklistedRegions.filter(
                (_, i) => i !== index,
            );
            setBlacklistedRegions(newRegions);
            setActiveRegionIndex(null);
        },
        [state.blacklistedRegions, setBlacklistedRegions],
    );

    const handleRegionDragStart = useCallback((index: number) => {
        setDraggingIndex(index);
    }, []);

    const handleRegionDragEnd = (event: MarkerDragStartEndEvent) => {
        if (draggingIndex !== null) {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            const newRegions = state.blacklistedRegions.map((region, index) =>
                index === draggingIndex
                    ? { ...region, latitude, longitude }
                    : region,
            );
            setBlacklistedRegions(newRegions);
        }
        setDraggingIndex(null);
    };

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

    useEffect(() => {
        // @dev During onboarding we don't want to save these onChange etc.
        if (saveChangesToBackend) {
            const prevRegions = prevBlacklistedRegionsRef.current;
            const currentRegions = state.blacklistedRegions;

            // Check if the regions have actually changed
            const hasChanged =
                JSON.stringify(prevRegions) !== JSON.stringify(currentRegions);

            if (hasChanged) {
                // @dev timer = debounce
                const timer = setTimeout(async () => {
                    try {
                        await API.user.userControllerUpdateUser({
                            userId: state.id!,
                            updateUserDTO: {
                                blacklistedRegions: currentRegions.map((r) =>
                                    mapRegionToBlacklistedRegionDTO(r),
                                ),
                            },
                        });
                        // Update the ref after successful update
                        prevBlacklistedRegionsRef.current = currentRegions;
                    } catch (error) {
                        // TODO We might want to show an error somehow, maybe we just throw the error for the global error handler for now
                        throw error;
                    }
                }, 1000);

                return () => clearTimeout(timer);
            }
        }
    }, [state.blacklistedRegions, state.id]);

    const handleMapPress = useCallback(() => {
        if (activeRegionIndex !== null) {
            setActiveRegionIndex(null);
        }
    }, [activeRegionIndex]);

    const { eventEmitter, stop: stopTourGuide } = useTourGuideController(
        TOURKEY.FIND,
    );

    const handleTourOnStop = async (e: any) => {
        // @dev Clear mocked states, force re-render
        await saveLocalValue(LOCAL_VALUE.HAS_DONE_FIND_WALKTHROUGH, "true");
        triggerForceRerender(forceRerender + 1);
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

    return (
        <TouchableWithoutFeedback onPress={handleMapPress}>
            <TourGuideZone
                zone={3}
                tourKey={TOURKEY.FIND}
                text={i18n.t(TR.tourSafeZones)}
                shape="rectangle"
            >
                <View style={styles.container}>
                    <TourGuideZone
                        zone={2}
                        tourKey={TOURKEY.FIND}
                        text={i18n.t(TR.tourHeatMap)}
                        shape="rectangle"
                    >
                        <MapView
                            style={styles.map}
                            region={mapRegion}
                            initialRegion={mapRegion}
                            showsMyLocationButton={true}
                            showsUserLocation={true}
                            zoomControlEnabled={true}
                            zoomEnabled={true}
                            zoomTapEnabled={true}
                            maxZoomLevel={13}
                            minZoomLevel={8}
                            onPress={handleMapPress}
                            onLongPress={
                                showBlacklistedRegions
                                    ? handleMapLongPress
                                    : undefined
                            }
                            provider={getMapProvider()}
                        >
                            <OHeatMap
                                showMap={showHeatmap}
                                currentMapRegion={mapRegion}
                                userId={state.id}
                                datingMode={state.dateMode}
                                forceRerender={forceRerender}
                            />

                            {showBlacklistedRegions &&
                                state.blacklistedRegions.map(
                                    (region, index) => (
                                        <React.Fragment key={`region-${index}`}>
                                            <Circle
                                                center={region}
                                                radius={region?.radius}
                                                fillColor={
                                                    index === activeRegionIndex
                                                        ? "rgba(255, 0, 0, 0.4)"
                                                        : "rgba(255, 0, 0, 0.2)"
                                                }
                                                strokeColor={
                                                    index === activeRegionIndex
                                                        ? "rgba(255, 0, 0, 0.8)"
                                                        : "rgba(255, 0, 0, 0.5)"
                                                }
                                            />
                                            <Marker
                                                coordinate={region}
                                                title={i18n.t(
                                                    TR.youAreUndercover,
                                                )}
                                                description={i18n.t(
                                                    TR.nobodyWillSeeYou,
                                                )}
                                                draggable={true}
                                                onDragStart={() =>
                                                    handleRegionDragStart(index)
                                                }
                                                onDragEnd={handleRegionDragEnd}
                                                onPress={() =>
                                                    handleRegionPress(index)
                                                }
                                                tracksViewChanges={false}
                                            />
                                        </React.Fragment>
                                    ),
                                )}
                        </MapView>
                    </TourGuideZone>
                    {showBlacklistedRegions && activeRegionIndex !== null && (
                        <OFloatingActionButton
                            size="xs"
                            style={styles.fab}
                            icon="delete-outline"
                            action={() => handleRemoveRegion(activeRegionIndex)}
                            color={Color.red}
                        />
                    )}
                    {showBlacklistedRegions && (
                        <View style={styles.instructions}>
                            <Text style={[Subtitle, styles.instructionText]}>
                                {i18n.t(TR.longPressMapSafeZoneInstruction)}
                            </Text>
                        </View>
                    )}
                    {showBlacklistedRegions && activeRegionIndex !== null && (
                        <View style={styles.sliderContainer}>
                            <Text style={[Subtitle, styles.sliderText]}>
                                {i18n.t(TR.adjustRegionRadius)} (
                                {Math.round(
                                    state.blacklistedRegions[activeRegionIndex]
                                        ?.radius,
                                )}
                                m)
                            </Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={100}
                                maximumValue={2000}
                                step={10}
                                value={tempSliderValue}
                                onValueChange={handleRadiusChange}
                            />
                        </View>
                    )}
                </View>
            </TourGuideZone>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    fab: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1000,
    },
    map: {
        width: "100%",
        minHeight: 400,
        borderRadius: BorderRadius.br_5xs,
    },
    instructions: {
        marginTop: 20,
    },
    instructionText: {
        marginBottom: 5,
        fontSize: FontSize.size_sm,
    },
    sliderContainer: {
        marginTop: 20,
    },
    sliderText: {
        fontSize: FontSize.size_md,
        marginBottom: 5,
    },
    slider: {
        width: "100%",
    },
    sliderValue: {
        color: Color.white,
        textAlign: "center",
    },
});
