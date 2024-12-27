import { UserPrivateDTODateModeEnum, WeightedLatLngDTO } from "@/api/gen/src";
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
    datingMode: UserPrivateDTODateModeEnum;
    currentMapRegion: Region;
}

export const OHeatMap: React.FC<OHeatMapProps> = React.memo(
    ({ showMap, datingMode, userId, currentMapRegion }) => {
        if (!showMap || isExpoGoEnvironment) {
            return <></>;
        }
        const [locationsFromOthers, setLocationsFromOthers] = useState<
            WeightedLatLngDTO[]
        >([]);

        useEffect(() => {
            if (datingMode === UserPrivateDTODateModeEnum.live) {
                getOtherUsersPositions();
            }
        }, [datingMode, userId]);

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
            setLocationsFromOthers([]);
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
                    Sentry.captureException(
                        new Error(
                            "Undefined user id in getOtherUsersPosition (Heatmap)",
                        ),
                        {
                            tags: { heatMap: "getOtherUsersPositions" },
                        },
                    );
                    throw new Error(
                        "Cannot load heatmap data as no userId defined.",
                    );
                }
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
