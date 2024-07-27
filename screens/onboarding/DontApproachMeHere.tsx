import * as React from "react";
import {StyleSheet, Text, View, Platform, Pressable} from "react-native";
import {OButtonWide} from "../../components/OButtonWide/OButtonWide";
import {OPageContainer} from "../../components/OPageContainer/OPageContainer";
import MapView, {
    LatLng,
    MapPressEvent,
    PROVIDER_DEFAULT,
    PROVIDER_GOOGLE,
    Circle,
    Marker
} from "react-native-maps";
import {BorderRadius, Color, Subtitle} from "../../GlobalStyles";
import Slider from '@react-native-community/slider';
import {EACTION_USER, MapRegion, useUserContext} from "../../context/UserContext";
import {MaterialIcons} from "@expo/vector-icons";
import {ROUTES} from "../routes";

const DontApproachMeHere = ({navigation}) => {
    const {state, dispatch} = useUserContext()
    const [activeRegionIndex, setActiveRegionIndex] = React.useState<number | null>(null);

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

    return (
        <OPageContainer
            title="Don't approach me here"
            bottomContainerChildren={<OButtonWide text="Continue" filled={true}
                                                  variant="dark" onPress={() => navigation.navigate(ROUTES.Onboarding.ApproachMeBetween)} />}
            subtitle="What are spots you don't want to be approached at? Your Gym, workplace?"
        >
            <>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 47.257832302,
                        longitude: 11.383665132,
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
                                onPress={() => handleRegionPress(index)}
                                opacity={0} // Make the marker invisible
                            />
                        </React.Fragment>
                    ))}

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
        top: 175,
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