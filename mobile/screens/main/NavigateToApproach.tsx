import { BorderRadius, Color, FontFamily, FontSize } from "@/GlobalStyles";
import { OLoadingSpinner } from "@/components/OLoadingCircle/OLoadingCircle";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import OTeaserProfilePreview from "@/components/OTeaserProfilePreview/OTeaserProfilePreview";
import { getPublicProfileFromEncounter } from "@/context/EncountersContext";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { EncounterStackParamList } from "@/screens/main/EncounterStack.navigator";
import { ROUTES } from "@/screens/routes";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { API } from "@/utils/api-config";
import { getTimePassedWithText } from "@/utils/date.utils";
import { getMapProvider } from "@/utils/map-provider";
import { calculateDistance, getRegionForCoordinates } from "@/utils/map.utils";
import * as Sentry from "@sentry/react-native";
import * as Location from "expo-location";
import { LocationAccuracy } from "expo-location";
import * as React from "react";
import { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const NavigateToApproach = ({
    route,
    navigation,
}: NativeStackScreenProps<
    EncounterStackParamList,
    typeof ROUTES.Main.NavigateToApproach
>) => {
    const navigateToPerson: IEncounterProfile = route.params.navigateToPerson;

    const { state } = useUserContext();
    const [isLoading, setIsLoading] = useState(false);
    const [mapRegion, setMapRegion] = useState<Region | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null,
    );
    const mapRef = React.useRef(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [destination, setDestination] = useState<{
        lastTimeLocationUpdated: Date;
        longitude: number;
        latitude: number;
    } | null>(null);

    useEffect(() => {
        let intervalId: string | number | NodeJS.Timeout | undefined;
        let isFirstRun = true;
        const fetchLocations = async () => {
            try {
                setIsLoading(isFirstRun);

                let { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    alert(i18n.t(TR.permissionToLocationDenied));
                    return;
                }
                const location = await Location.getCurrentPositionAsync({
                    accuracy: LocationAccuracy.BestForNavigation,
                });
                setLocation(location);

                /** @DEV name might be misleading, this is actually the REAL location of the other user, not the location where they met. */
                const encounterLoc =
                    await API.encounter.encounterControllerGetLocationOfEncounter(
                        {
                            userId: state.id!,
                            encounterId: navigateToPerson.encounterId,
                        },
                    );

                setDestination(encounterLoc);
            } catch (error) {
                console.error("Error fetching locations:", error);
                Sentry.captureException(error, {
                    tags: {
                        navigateTo: "fetchingLocation",
                    },
                });
            } finally {
                isFirstRun = false;
                setIsLoading(false);
            }
        };
        fetchLocations();
        intervalId = setInterval(fetchLocations, 5000);

        /** @DEV - clear the interval if component is unmounted */
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [state.id, navigateToPerson.encounterId]);

    useEffect(() => {
        if (location && destination) {
            const calculatedDistance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                destination.latitude,
                destination.longitude,
            );
            setDistance(calculatedDistance);

            const newRegion = getRegionForCoordinates([
                {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                destination,
            ]);
            setMapRegion(newRegion);
        }
    }, [location, destination]);

    const openMapsApp = () => {
        const scheme = Platform.select({
            ios: "maps:0,0?q=",
            android: "geo:0,0?q=",
        });
        const latLng = `${destination!.latitude},${destination!.longitude}`;
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
                // TODO navigate to disabled for now
                // secondButton={{
                //     onPress: openMapsApp,
                //     disabled: !destination,
                //     text: `${i18n.t(TR.navigateTo)}`,
                //     style: styles.navigateBtn,
                // }}
            />
            {!isLoading && destination?.lastTimeLocationUpdated && (
                <Text style={styles.lastUpdateText}>
                    {i18n.t(TR.userLocationWasUpdatedLastTime)}
                    <Text style={styles.lastUpdateTimeText}>
                        {getTimePassedWithText(
                            destination?.lastTimeLocationUpdated?.toISOString(),
                        )}
                    </Text>
                </Text>
            )}
            {isLoading ? (
                <OLoadingSpinner
                    size={60}
                    color={Color.primary}
                    text={i18n.t(TR.loadingTextNavigateTo)}
                />
            ) : (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion || undefined}
                    provider={getMapProvider()}
                >
                    {location && (
                        <Marker
                            coordinate={location.coords}
                            title={i18n.t(TR.yourLocation)}
                            pinColor={Color.black}
                        />
                    )}
                    {destination && (
                        <Marker
                            coordinate={destination}
                            title={navigateToPerson.firstName}
                        />
                    )}
                    {location && destination && (
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
            )}
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
        borderColor: Color.primaryBright,
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
    lastUpdateText: {
        textAlign: "center",
        marginBottom: 10,
    },
    lastUpdateTimeText: {
        color: Color.primary,
    },
});

export default NavigateToApproach;
