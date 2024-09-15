import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

import { BorderRadius, Color, FontSize, Subtitle } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { EACTION_USER, MapRegion, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { getMapProvider } from "@/utils/map-provider";
import { ROUTES } from "../routes";

type DontApproachMeHereProps = NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.DontApproachMeHere
>;

const DontApproachMeHere: React.FC<DontApproachMeHereProps> = ({
    navigation,
}) => {
    const { state, dispatch } = useUserContext();
    const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(
        null,
    );
    const mapRef = useRef<MapView | null>(null);
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: 47.257832302,
        longitude: 11.383665132,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [draggedRegion, setDraggedRegion] = useState<MapRegion | null>(null);

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
        (event: {
            nativeEvent: {
                coordinate: { latitude: number; longitude: number };
            };
        }) => {
            const { coordinate } = event.nativeEvent;
            const { latitude, longitude } = coordinate;
            setBlacklistedRegions([
                ...state.blacklistedRegions,
                { latitude, longitude, radius: 100 },
            ]);
            setActiveRegionIndex(state.blacklistedRegions.length);
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

    const handleRegionDragStart = useCallback(
        (index: number) => {
            setDraggedRegion(state.blacklistedRegions[index]);
        },
        [state.blacklistedRegions],
    );

    const handleRegionDrag = useCallback(
        (event: {
            nativeEvent: {
                coordinate: { latitude: number; longitude: number };
            };
        }) => {
            if (draggedRegion) {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                setDraggedRegion({ ...draggedRegion, latitude, longitude });
            }
        },
        [draggedRegion],
    );

    const handleRegionDragEnd = useCallback(() => {
        if (draggedRegion && activeRegionIndex !== null) {
            const newRegions = state.blacklistedRegions.map((region, i) =>
                i === activeRegionIndex ? draggedRegion : region,
            );
            setBlacklistedRegions(newRegions);
            setDraggedRegion(null);
        }
    }, [
        draggedRegion,
        activeRegionIndex,
        state.blacklistedRegions,
        setBlacklistedRegions,
    ]);

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

    return (
        <OPageContainer
            subtitle={i18n.t(TR.whatAreSpotsToNotApproachYou)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.ApproachMeBetween)
                    }
                />
            }
        >
            <>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    showsMyLocationButton={true}
                    showsUserLocation={true}
                    initialRegion={mapRegion}
                    onLongPress={handleMapLongPress}
                    provider={getMapProvider()}
                >
                    {state.blacklistedRegions.map((region, index) => (
                        <React.Fragment key={`region-${index}`}>
                            <Circle
                                center={
                                    draggedRegion && index === activeRegionIndex
                                        ? draggedRegion
                                        : region
                                }
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
                                coordinate={
                                    draggedRegion && index === activeRegionIndex
                                        ? draggedRegion
                                        : region
                                }
                                title={i18n.t(TR.youAreUndercover)}
                                description={i18n.t(TR.nobodyWillSeeYou)}
                                draggable={true}
                                onDragStart={() => handleRegionDragStart(index)}
                                onDrag={handleRegionDrag}
                                onDragEnd={handleRegionDragEnd}
                                onPress={() => handleRegionPress(index)}
                                tracksViewChanges={false}
                            />
                        </React.Fragment>
                    ))}
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
                {activeRegionIndex !== null && (
                    <View style={styles.sliderContainer}>
                        <Text style={[Subtitle, styles.sliderText]}>
                            {i18n.t(TR.adjustRegionRadius)}&nbsp;(
                            {Math.round(
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
                                    .radius
                            }
                            onValueChange={handleRadiusChange}
                        />
                    </View>
                )}
                <View style={styles.instructions}>
                    <Text style={[Subtitle, styles.instructionText]}>
                        {i18n.t(TR.longPressMapSafeZoneInstruction)}
                    </Text>
                </View>
            </>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        minHeight: 300,
        borderRadius: BorderRadius.br_5xs,
    },
    removeButtonContainer: {
        position: "absolute",
        bottom: 130,
        left: 5,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 20,
        padding: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    sliderText: {
        fontSize: FontSize.size_md,
        marginBottom: 5,
    },
    instructions: {
        marginTop: 12,
    },
    instructionText: {
        marginBottom: 5,
        fontSize: FontSize.size_sm,
    },
    sliderContainer: {
        marginTop: 12,
    },
    slider: {
        width: "100%",
    },
    sliderValue: {
        color: Color.white,
        textAlign: "center",
    },
});

export default DontApproachMeHere;
