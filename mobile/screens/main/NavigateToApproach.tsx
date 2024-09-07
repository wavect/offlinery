import { BorderRadius, Color, FontFamily, FontSize } from "@/GlobalStyles";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import OTeaserProfilePreview from "@/components/OTeaserProfilePreview/OTeaserProfilePreview";
import { getPublicProfileFromEncounter } from "@/context/EncountersContext";
import { TR, i18n } from "@/localization/translate.service";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { calculateDistance, getRegionForCoordinates } from "@/utils/map.utils";
import * as Location from "expo-location";
import { LocationAccuracy } from "expo-location";
import * as React from "react";
import { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import MapView, {
    Marker,
    PROVIDER_DEFAULT,
    PROVIDER_GOOGLE,
    Polyline,
    Region,
} from "react-native-maps";

const NavigateToApproach = ({ route, navigation }) => {
    const navigateToPerson: IEncounterProfile = route.params?.navigateToPerson;

    // TODO: Load from backend, add to encounter profile!
    const destination = { latitude: 47.27062, longitude: 11.49267 }; // Example: San Francisco
    const [mapRegion, setMapRegion] = useState<Region | null>(null);

    const [location, setLocation] = useState<Location.LocationObject | null>(
        null,
    );
    const mapRef = React.useRef(null);
    const [distance, setDistance] = useState<number | null>(null);

    // TODO: Provider Google should also work for IOS, but ONLY WITHOUT EXPO GO!
    // TODO: Maybe make map to a separate component
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert(i18n.t(TR.permissionToLocationDenied));
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: LocationAccuracy.BestForNavigation,
            });
            setLocation(location);
        })();
    }, []);

    useEffect(() => {
        if (location) {
            const calculatedDistance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                destination.latitude,
                destination.longitude,
            );
            setDistance(calculatedDistance);

            // Calculate the region that includes both points
            const newRegion = getRegionForCoordinates([
                {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                destination,
            ]);
            setMapRegion(newRegion);
        }
    }, [location]);

    const openMapsApp = () => {
        const scheme = Platform.select({
            ios: "maps:0,0?q=",
            android: "geo:0,0?q=",
        });
        const latLng = `${destination.latitude},${destination.longitude}`;
        const label = i18n.t(TR.destination);
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        Linking.openURL(url!);
    };

    return (
        <OPageContainer>
            <OTeaserProfilePreview
                prefixText={i18n.t(TR.findWithSpace)}
                navigation={navigation}
                publicProfile={getPublicProfileFromEncounter(navigateToPerson)}
                showOpenProfileButton={true}
                secondButton={{
                    onPress: openMapsApp,
                    text: `${i18n.t(TR.navigateTo)} ${navigateToPerson.firstName}`,
                    style: styles.navigateBtn,
                }}
            />
            <MapView
                ref={mapRef}
                style={styles.map}
                region={mapRegion || undefined}
                initialRegion={{
                    latitude: destination.latitude ?? 47.257832302,
                    longitude: destination.longitude ?? 11.383665132,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                provider={
                    process.env.NODE_ENV === "production"
                        ? PROVIDER_GOOGLE
                        : PROVIDER_DEFAULT
                }
            >
                {location && (
                    <Marker
                        coordinate={location.coords}
                        title={i18n.t(TR.yourLocation)}
                        pinColor={Color.black}
                    />
                )}
                <Marker
                    coordinate={destination}
                    title={navigateToPerson.firstName}
                />
                {location && (
                    <>
                        <Polyline
                            coordinates={[
                                {
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                },
                                destination,
                            ]}
                            strokeColor={Color.primary}
                            strokeWidth={2}
                        />
                        <Marker
                            coordinate={{
                                latitude:
                                    (location.coords.latitude +
                                        destination.latitude) /
                                    2,
                                longitude:
                                    (location.coords.longitude +
                                        destination.longitude) /
                                    2,
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.distanceMarker}>
                                <Text style={styles.distanceText}>
                                    {distance
                                        ? `${distance.toFixed(2)} km`
                                        : i18n.t(TR.calculating)}
                                </Text>
                            </View>
                        </Marker>
                    </>
                )}
            </MapView>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        height: "100%",
        minHeight: 300,
        borderRadius: BorderRadius.br_5xs,
    },
    navigateBtn: {
        backgroundColor: Color.primary,
        borderColor: Color.primaryLight,
    },
    distanceMarker: {
        backgroundColor: "white",
        padding: 5,
        borderRadius: 5,
        borderColor: Color.primary,
        borderWidth: 1,
    },
    distanceText: {
        color: Color.primary,
        fontFamily: FontFamily.montserratRegular,
        fontSize: FontSize.size_sm,
    },
});

export default NavigateToApproach;
