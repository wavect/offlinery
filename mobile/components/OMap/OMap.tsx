import { BorderRadius, Color, FontSize, Subtitle } from "@/GlobalStyles";
import { UserPrivateDTODateModeEnum, WeightedLatLngDTO } from "@/api/gen/src";
import { OFloatingActionButton } from "@/components/OFloatingActionButton/OFloatingActionButton";
import { OHeatMap } from "@/components/OHeatMap/OHeatMap";
import {
    EACTION_USER,
    MapRegion,
    mapRegionToBlacklistedRegionDTO,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { API } from "@/utils/api-config";
import { getMapProvider } from "@/utils/map-provider";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { LocationAccuracy } from "expo-location";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import MapView, {
    Circle,
    LongPressEvent,
    Marker,
    MarkerDragStartEndEvent,
    Region,
} from "react-native-maps";

export interface OMapRefType {
    getOtherUsersPositions: () => Promise<void>;
}

interface OMapProps {
    saveChangesToBackend: boolean;
    showHeatmap: boolean;
    showBlacklistedRegions: boolean;
}

export const OMap = forwardRef<OMapRefType | null, OMapProps>((props, ref) => {
    const { saveChangesToBackend, showHeatmap, showBlacklistedRegions } = props;
    const { state, dispatch } = useUserContext();
    const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(
        null,
    );
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null,
    );
    const [locationsFromOthers, setLocationsFromOthers] = useState<
        WeightedLatLngDTO[]
    >([]);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const mapRef = useRef<MapView | null>(null);
    const prevBlacklistedRegionsRef = useRef<MapRegion[]>([]);
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: 47.257832302,
        longitude: 11.383665132,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        (async () => {
            if (state.dateMode === UserPrivateDTODateModeEnum.ghost) {
                setLocationsFromOthers([]);
            } else {
                const promises = [];
                if (showHeatmap) {
                    promises.push(getOtherUsersPositions());
                }

                let { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    alert("Permission to access location was denied");
                    return;
                }

                promises.push(getUserPosition());
                await Promise.all(promises);
            }
        })();
    }, [state.dateMode]);

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
            const location = await Location.getCurrentPositionAsync({
                accuracy: LocationAccuracy.BestForNavigation,
            });
            setLocation(location);
        } catch (e) {
            console.warn("Unable to get user locations");
        }
    };

    const getOtherUsersPositions = async () => {
        try {
            const positions = await API.map.mapControllerGetUserLocations({
                userId: state.id!,
            });
            setLocationsFromOthers(positions);
        } catch (e) {
            console.warn("Unable to get position from other users ", e);
        }
    };

    useImperativeHandle(ref, () => ({
        getOtherUsersPositions,
    }));

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
                { latitude, longitude, radius: 1000 },
            ]);
        },
        [state.blacklistedRegions, setBlacklistedRegions],
    );

    const handleRegionPress = useCallback((index: number) => {
        setActiveRegionIndex(index);
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

    const handleRegionDragEnd = useCallback(
        (event: MarkerDragStartEndEvent) => {
            if (draggingIndex !== null) {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                const newRegions = state.blacklistedRegions.map(
                    (region, index) =>
                        index === draggingIndex
                            ? { ...region, latitude, longitude }
                            : region,
                );
                setBlacklistedRegions(newRegions);
            }
            setDraggingIndex(null);
        },
        [draggingIndex, state.blacklistedRegions, setBlacklistedRegions],
    );

    const handleRadiusChange = useCallback(
        (value: number) => {
            if (activeRegionIndex !== null) {
                const newRegions = state.blacklistedRegions.map(
                    (region, index) =>
                        index === activeRegionIndex
                            ? { ...region, radius: value }
                            : region,
                );
                setBlacklistedRegions(newRegions);
            }
        },
        [activeRegionIndex, state.blacklistedRegions, setBlacklistedRegions],
    );

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

    const handleMapPress = useCallback(
        (event: any) => {
            if (activeRegionIndex !== null) {
                setActiveRegionIndex(null);
            }
        },
        [activeRegionIndex],
    );

    return (
        <TouchableWithoutFeedback onPress={handleMapPress}>
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    initialRegion={mapRegion}
                    showsMyLocationButton={true}
                    showsUserLocation={true}
                    zoomControlEnabled={true}
                    zoomEnabled={true}
                    zoomTapEnabled={true}
                    maxZoomLevel={13}
                    onPress={handleMapPress}
                    onLongPress={
                        showBlacklistedRegions ? handleMapLongPress : undefined
                    }
                    provider={getMapProvider()}
                >
                    {showHeatmap && locationsFromOthers && (
                        <OHeatMap locations={locationsFromOthers} />
                    )}

                    {showBlacklistedRegions &&
                        state.blacklistedRegions.map((region, index) => (
                            <React.Fragment key={`region-${index}`}>
                                <Circle
                                    center={region}
                                    radius={region.radius}
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
                                    title={i18n.t(TR.youAreUndercover)}
                                    description={i18n.t(TR.nobodyWillSeeYou)}
                                    draggable={true}
                                    onDragStart={() =>
                                        handleRegionDragStart(index)
                                    }
                                    onDragEnd={handleRegionDragEnd}
                                    onPress={() => handleRegionPress(index)}
                                    tracksViewChanges={false}
                                />
                            </React.Fragment>
                        ))}
                    {location && (
                        <Marker
                            title={i18n.t(TR.myLocation)}
                            description={i18n.t(TR.youAreHere)}
                            pinColor="blue"
                            coordinate={location.coords}
                            tracksViewChanges={false}
                        />
                    )}
                </MapView>
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
                            value={
                                state.blacklistedRegions[activeRegionIndex]
                                    ?.radius
                            }
                            onValueChange={handleRadiusChange}
                        />
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
});

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
