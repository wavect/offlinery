import * as React from "react";
import {useEffect, useState} from "react";
import {Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import MapView, {
    Circle,
    MapPressEvent,
    Marker,
    MarkerDragEvent,
    PROVIDER_DEFAULT,
    PROVIDER_GOOGLE
} from "react-native-maps";
import {BorderRadius, Color, Subtitle} from "../../GlobalStyles";
import Slider from '@react-native-community/slider';
import {EACTION_USER, MapRegion, useUserContext} from "../../context/UserContext";
import {MaterialIcons} from "@expo/vector-icons";
import * as Location from 'expo-location';
import {LocationAccuracy} from 'expo-location';

const DontApproachMeHere = ({navigation}) => {
    const {state, dispatch} = useUserContext()
    const [activeRegionIndex, setActiveRegionIndex] = React.useState<number | null>(null);
    const [location, setLocation] = useState<Location.LocationObject|null>(null);
    const mapRef = React.useRef(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: 47.257832302,
        longitude: 11.383665132,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    // TODO: Also add home base here (or maybe just remove that screen altogether?)

    // TODO: Request background permission when setting user live in separate component
    // TODO: Maybe make map to a separate component
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({accuracy: LocationAccuracy.BestForNavigation});
            setLocation(location);
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


    const setBlacklistedRegions = (blacklistedRegions: MapRegion[]) => {
        dispatch({type: EACTION_USER.SET_BLACKLISTED_REGIONS, payload: blacklistedRegions})
    }

    const handleMapLongPress = (event: MapPressEvent) => {
        const {coordinate} = event.nativeEvent;
        setBlacklistedRegions([...state.blacklistedRegions, {center: coordinate, radius: 100}]);
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
                radius: value
            };
            setBlacklistedRegions(newRegions);
        }
    };

    const handleRemoveRegion = (index: number) => {
        const newRegions = state.blacklistedRegions.filter((_, i) => i !== index);
        setBlacklistedRegions(newRegions);
        setActiveRegionIndex(null);
    };

    const handleRegionDrag = (event: MarkerDragEvent, index: number) => {
        state.blacklistedRegions[index].center = event.nativeEvent.coordinate
        setBlacklistedRegions(state.blacklistedRegions)
    }

    return (
        <OPageContainer subtitle="Being near these hotspots increases your odds of meeting your soulmate.">
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
                    onLongPress={handleMapLongPress}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                >
                    {state.blacklistedRegions.map((region, index) => (
                        <React.Fragment key={`region-${index}`}>
                            <Circle
                                center={region.center}
                                radius={region.radius}
                                fillColor={index === activeRegionIndex ? "rgba(255, 0, 0, 0.4)" : "rgba(255, 0, 0, 0.2)"}
                                strokeColor={index === activeRegionIndex ? "rgba(255, 0, 0, 0.8)" : "rgba(255, 0, 0, 0.5)"}
                            />
                            <Marker
                                coordinate={region.center}
                                title="You're undercover"
                                description="Nobody will see you here."
                                draggable={true}
                                onDrag={(ev) => handleRegionDrag(ev, index)}
                                onPress={() => handleRegionPress(index)}
                                tracksViewChanges={false}
                            />
                        </React.Fragment>
                    ))}
                    {location && <Marker
                        title="My Location"
                        description="You are here"
                        pinColor="blue"
                        coordinate={location.coords}
                        tracksViewChanges={false}
                    />}

                </MapView>
                {activeRegionIndex !== null && (
                    <Pressable style={styles.removeButtonContainer}
                               onPress={() => handleRemoveRegion(activeRegionIndex)}>
                        <MaterialIcons
                            name="delete-outline"
                            size={40}
                            color="red"
                        />
                    </Pressable>
                )}
                <View style={styles.instructions}>
                    <Text style={[Subtitle, styles.instructionText]}>
                        Long press on the map to add a circular region. Tap a region to select it and adjust its radius.
                    </Text>
                </View>
                {activeRegionIndex !== null && (
                    <View style={styles.sliderContainer}>
                        <Text style={[Subtitle, styles.instructionText]}>Adjust Region Radius ({Math.round(state.blacklistedRegions[activeRegionIndex].radius)}m)</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={100}
                            maximumValue={1000}
                            step={10}
                            value={state.blacklistedRegions[activeRegionIndex].radius}
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
        width: '100%',
        height: '50%',
        borderRadius: BorderRadius.br_5xs,
    },
    removeButtonContainer: {
        position: 'absolute',
        top: 70,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructions: {
        marginTop: 10,
        padding: 10,
    },
    instructionText: {
        marginBottom: 5,
    },
    sliderContainer: {
        marginTop: 5,
        padding: 10,
    },
    slider: {
        width: '100%',
    },
    sliderValue: {
        color: Color.white,
        textAlign: 'center',
    },
});

export default DontApproachMeHere;