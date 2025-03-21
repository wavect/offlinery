import { WeightedLatLngDTO } from "@/api/gen/src";
import { MOCK_HEATMAP_LOCATIONS, TOURKEY } from "@/services/tourguide.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import { isExpoGoEnvironment } from "@/utils/expo.utils";
import * as Sentry from "@sentry/react-native";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Heatmap, Region } from "react-native-maps";
import { useTourGuideController } from "rn-tourguide";

interface OHeatMapProps {
    showMap: boolean;
    userId?: string;
    currentMapRegion: Region;
    onLoadingStateChange: (isLoading: boolean) => void;
}

export const OHeatMap: React.FC<OHeatMapProps> = React.memo(
    ({ showMap, userId, currentMapRegion, onLoadingStateChange }) => {
        if (!showMap || isExpoGoEnvironment) {
            return <></>;
        }
        const [locationsFromOthers, setLocationsFromOthers] = useState<
            WeightedLatLngDTO[]
        >([]);

        useEffect(() => {
            getOtherUsersPositions();
        }, [userId]);

        const { eventEmitter } = useTourGuideController(TOURKEY.FIND);

        const handleTourOnStepChange = (e: any) => {
            if (e?.order === 2) {
                setLocationsFromOthers(
                    MOCK_HEATMAP_LOCATIONS(currentMapRegion),
                );
                return;
            }
        };

        const handleTourOnStop = () => {
            getOtherUsersPositions();
        };

        useEffect(() => {
            if (!eventEmitter) return;
            eventEmitter?.on("stepChange", handleTourOnStepChange);
            eventEmitter?.on("stop", handleTourOnStop);

            return () => {
                eventEmitter?.off("stepChange", handleTourOnStepChange);
                eventEmitter?.off("stop", handleTourOnStop);
            };
            // @dev Keep mapRegion in dependency to mock heatmap along current mapRegion
        }, [eventEmitter, currentMapRegion]);

        const getOtherUsersPositions = async () => {
            try {
                if (!userId) {
                    // not ready yet (e.g. on registration)
                    return;
                }
                onLoadingStateChange(true);
                const positions = await API.map.mapControllerGetUserLocations({
                    userId,
                });

                setLocationsFromOthers(positions);
            } catch (error) {
                console.error(
                    "Unable to get position from other users ",
                    error,
                );
                Sentry.captureException(error, {
                    tags: {
                        map: "heatmap",
                    },
                });
                setLocationsFromOthers([]);
            } finally {
                onLoadingStateChange(false);
            }
        };

        // Use platform-specific radius
        const heatmapRadius = Platform.select({
            android: 50, // Android requires 10-50
            ios: 200, // iOS can handle larger values
            default: 50,
        });

        // @dev Android crashes even with empty array.
        if (!locationsFromOthers?.length) return;
        return (
            <Heatmap
                testID={TestData.encounters.heatMapComponent}
                points={locationsFromOthers}
                opacity={0.6}
                radius={heatmapRadius}
                gradient={{
                    colors: ["blue", "green", "yellow", "red"],
                    startPoints: [0.01, 0.25, 0.5, 0.75],
                    colorMapSize: 256,
                }}
            />
        );
    },
);
