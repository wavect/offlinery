import { BorderRadius, Color, Subtitle } from "@/GlobalStyles";
import { MapApi, UserApi, WeightedLatLngDTO } from "@/api/gen/src";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import {
    EACTION_USER,
    MapRegion,
    mapRegionToBlacklistedRegionDTO,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { includeJWT } from "@/utils/misc.utils";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { LocationAccuracy } from "expo-location";
import * as React from "react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, {
    Circle,
    Heatmap,
    LongPressEvent,
    Marker,
    MarkerDragEvent,
    PROVIDER_GOOGLE,
} from "react-native-maps";

const userApi = new UserApi();
const mapApi = new MapApi();

const Map = () => {
    const { state, dispatch } = useUserContext();
    const [activeRegionIndex, setActiveRegionIndex] = React.useState<
        number | null
    >(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null,
    );
    const [locationsFromOthers, setLocationsFromOthers] =
        useState<WeightedLatLngDTO[]>();
    const mapRef = React.useRef(null);
    const [mapRegion, setMapRegion] = useState({
        // Uni Ibk
        latitude: 47.257832302,
        longitude: 11.383665132,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permission to access location was denied");
                return;
            }

            await getUserPosition();
            await getOtherUsersPositions();
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

    useEffect(() => {
        async function updateBlacklistedRegion(regions: MapRegion[]) {
            try {
                await userApi.userControllerUpdateUser(
                    {
                        userId: state.id!,
                        user: {
                            blacklistedRegions: regions.map((r) =>
                                mapRegionToBlacklistedRegionDTO(r),
                            ),
                        },
                    },
                    await includeJWT(),
                );
            } catch (error) {
                console.error("Error updating blacklisted regions:", error);
            }
        }
        const timer = setTimeout(() => {
            const newRegions = [...state.blacklistedRegions];
            if (activeRegionIndex !== null) {
                const currRegion = newRegions[activeRegionIndex];
                newRegions[activeRegionIndex] = {
                    ...currRegion,
                    radius: currRegion.uiRadius ?? currRegion.radius,
                };
            }
            setBlacklistedRegions(newRegions);
            updateBlacklistedRegion(newRegions);
        }, 1000);
        return () => clearTimeout(timer);
    }, [state.blacklistedRegions[activeRegionIndex!]?.uiRadius]);

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
            const positions = await mapApi.mapControllerGetUserLocations(
                {
                    userId: state.id!,
                },
                await includeJWT(),
            );
            console.log("positions are: ", positions);
            setLocationsFromOthers(positions);
        } catch (e) {
            console.warn("Unable to get position from other users ", e);
        }
    };

    const setBlacklistedRegions = (blacklistedRegions: MapRegion[]) => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: { blacklistedRegions },
        });
    };

    const handleMapLongPress = (event: LongPressEvent) => {
        const { coordinate } = event.nativeEvent;
        const { latitude, longitude } = coordinate;
        setBlacklistedRegions([
            ...state.blacklistedRegions,
            { latitude, longitude, radius: 100, uiRadius: 100 },
        ]);
        setActiveRegionIndex(state.blacklistedRegions.length);
    };

    const handleRegionPress = (index: number) => {
        setActiveRegionIndex(index);
    };

    const handleRadiusChange = (value: number) => {
        if (activeRegionIndex !== null) {
            const newRegions = [...state.blacklistedRegions];
            newRegions[activeRegionIndex] = {
                ...newRegions[activeRegionIndex],
                uiRadius: value,
            };
            setBlacklistedRegions(newRegions);
        }
    };

    const handleRemoveRegion = (index: number) => {
        const newRegions = state.blacklistedRegions.filter(
            (_, i) => i !== index,
        );
        setBlacklistedRegions(newRegions);
        setActiveRegionIndex(null);
    };

    const handleRegionDrag = (event: MarkerDragEvent, index: number) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        state.blacklistedRegions[index].latitude = latitude;
        state.blacklistedRegions[index].longitude = longitude;
        setBlacklistedRegions(state.blacklistedRegions);
    };

    return (
        <OPageContainer subtitle={i18n.t(TR.beNearTheseHotspotsToMeet)}>
            <>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    initialRegion={{
                        latitude: location?.coords?.latitude ?? 47.257832302,
                        longitude: location?.coords?.longitude ?? 11.383665132,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    zoomControlEnabled={true}
                    zoomEnabled={true}
                    zoomTapEnabled={true}
                    onLongPress={handleMapLongPress}
                    provider={PROVIDER_GOOGLE}
                >
                    <Heatmap
                        opacity={1}
                        radius={50}
                        points={locationsFromOthers}
                    ></Heatmap>
                    {state.blacklistedRegions.map((region, index) => (
                        <React.Fragment key={`region-${index}`}>
                            <Circle
                                center={region}
                                radius={region.uiRadius ?? region.radius}
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
                                onDrag={(ev) => handleRegionDrag(ev, index)}
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
                {activeRegionIndex !== null && (
                    <Pressable
                        style={styles.removeButtonContainer}
                        onPress={() => handleRemoveRegion(activeRegionIndex)}
                    >
                        <MaterialIcons
                            name="delete-outline"
                            size={40}
                            color="red"
                        />
                    </Pressable>
                )}

                <View style={styles.instructions}>
                    <Text style={[Subtitle, styles.instructionText]}>
                        {i18n.t(TR.longPressMapSafeZoneInstruction)}
                    </Text>
                </View>
                {activeRegionIndex !== null && (
                    <View style={styles.sliderContainer}>
                        <Text
                            style={[
                                Subtitle,
                                styles.instructionText,
                                styles.bold,
                            ]}
                        >
                            {i18n.t(TR.adjustRegionRadius)} (
                            {Math.round(
                                state.blacklistedRegions[activeRegionIndex]
                                    .uiRadius ??
                                    state.blacklistedRegions[activeRegionIndex]
                                        .radius,
                            )}
                            m)
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={100}
                            maximumValue={1000}
                            step={10}
                            value={
                                state.blacklistedRegions[activeRegionIndex]
                                    .uiRadius ??
                                state.blacklistedRegions[activeRegionIndex]
                                    .radius
                            }
                            onValueChange={handleRadiusChange}
                        />
                    </View>
                )}
            </>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        minHeight: 400,
        borderRadius: BorderRadius.br_5xs,
    },
    removeButtonContainer: {
        position: "absolute",
        top: 70,
        right: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 20,
        padding: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    instructions: {
        marginTop: 20,
    },
    bold: {
        fontWeight: "bold",
    },
    instructionText: {
        marginBottom: 5,
    },
    sliderContainer: {
        marginTop: 20,
    },
    slider: {
        width: "100%",
    },
    sliderValue: {
        color: Color.white,
        textAlign: "center",
    },
});

export default Map;
