import { BorderRadius, Color, FontFamily, FontSize } from "@/GlobalStyles";
import { ResponseError } from "@/api/gen/src";
import { OLoadingSpinner } from "@/components/OLoadingCircle/OLoadingCircle";
import OMessageModal from "@/components/OMessageModal/OMessageModal";
import ONotNearbyAnymore from "@/components/ONotNearbyAnymore/ONotNearbyAnymore";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OPageHeader } from "@/components/OPageHeader/OPageHeader";
import { OPageHeaderEncounters } from "@/components/OPageHeader/OPageHeaderEncounters/OPageHeaderEncounters";
import OTeaserProfilePreview from "@/components/OTeaserProfilePreview/OTeaserProfilePreview";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { EncounterStackParamList } from "@/screens/main/EncounterStack.navigator";
import { ROUTES } from "@/screens/routes";
import { API } from "@/utils/api-config";
import { getTimePassedWithText } from "@/utils/date.utils";
import { getMapProvider } from "@/utils/map-provider";
import { calculateDistance, getRegionForCoordinates } from "@/utils/map.utils";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import BackgroundGeolocation, {
    Location,
} from "react-native-background-geolocation";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const NavigateToApproach = ({
    route,
    navigation,
}: NativeStackScreenProps<
    EncounterStackParamList,
    typeof ROUTES.Main.NavigateToApproach
>) => {
    const { navigateToPerson, encounterId } = route.params;
    const [isNearby, setIsNearby] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = React.useState(false);

    const { state } = useUserContext();
    const [isLoading, setIsLoading] = useState(false);
    const [mapRegion, setMapRegion] = useState<Region | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const mapRef = React.useRef(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [destination, setDestination] = useState<{
        lastTimeLocationUpdated: Date;
        longitude: number;
        latitude: number;
    } | null>(null);
    // Add mounted ref to prevent state updates after unmount, otherwise back btn not working
    const isMounted = React.useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const parent = navigation.getParent();

        if (parent) {
            // @dev This hides the help button on the NavigateTo screen which would not work here
            parent.setOptions({
                headerLeft: () => <OPageHeader title={i18n.t(TR.encounters)} />,
            });
        }

        return () => {
            if (parent) {
                parent.setOptions({
                    headerLeft: () => <OPageHeaderEncounters />,
                });
            }
        };
    }, [navigation]);

    useEffect(() => {
        let intervalId: string | number | NodeJS.Timeout | undefined;
        let isFirstRun = true;
        const fetchLocations = async () => {
            if (!isMounted.current) return;
            try {
                setIsLoading(isFirstRun);

                const location = await BackgroundGeolocation.getCurrentPosition(
                    {
                        desiredAccuracy:
                            BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
                    },
                );
                setLocation(location);

                /** @DEV name might be misleading, this is actually the REAL location of the other user, not the location where they met. */
                try {
                    const encounterLoc =
                        await API.encounter.encounterControllerGetLocationOfEncounter(
                            {
                                userId: state.id!,
                                encounterId,
                            },
                        );

                    setDestination(encounterLoc);
                    setIsNearby(true);
                } catch (err) {
                    // @dev expected error in many cases when uses is not nearby anymore is http code 412 (precondition failed)
                    if (
                        err instanceof ResponseError &&
                        err.response.status === 412
                    ) {
                        // @dev user not nearby (anymore)
                        setIsNearby(false);
                    } else {
                        // @dev actual unexpected error
                        throw err;
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching locations:", error);
                Sentry.captureException(error, {
                    tags: {
                        navigateTo: "fetchingLocation",
                    },
                });
                setIsLoading(false);
            } finally {
                isFirstRun = false;
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
    }, [state.id, navigateToPerson.id]);

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

    const openMapsApp = async () => {
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

        await Linking.openURL(url!);
    };

    const NavigateToMap = () =>
        isLoading ? (
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
        );

    return (
        <OPageContainer>
            <OTeaserProfilePreview
                prefixText={i18n.t(TR.findWithSpace)}
                navigation={navigation}
                publicProfile={navigateToPerson}
                showOpenProfileButton={true}
                secondButton={{
                    onPress: () => setModalVisible(true),
                    text: i18n.t(TR.leaveMessageBtnLbl),
                    style: styles.secondaryBtn,
                }}
                // TODO navigate to disabled for now
                // secondButton={{
                //     onPress: openMapsApp,
                //     disabled: !destination,
                //     text: `${i18n.t(TR.navigateTo)}`,
                //     style: styles.secondaryBtn,
                // }}
            />
            {isNearby && !isLoading && destination?.lastTimeLocationUpdated && (
                <Text style={styles.lastUpdateText}>
                    {i18n.t(TR.userLocationWasUpdatedLastTime)}
                    <Text style={styles.lastUpdateTimeText}>
                        {getTimePassedWithText(
                            destination?.lastTimeLocationUpdated?.toISOString(),
                        )}
                    </Text>
                </Text>
            )}
            {isNearby ? (
                <NavigateToMap />
            ) : (
                <ONotNearbyAnymore
                    otherUserFirstName={navigateToPerson.firstName}
                    setModalVisible={setModalVisible}
                />
            )}

            <OMessageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                userId={state.id!}
                encounterId={encounterId}
                firstName={navigateToPerson.firstName}
            />
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
    secondaryBtn: {
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
