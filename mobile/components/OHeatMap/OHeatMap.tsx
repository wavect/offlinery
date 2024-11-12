import { WeightedLatLngDTO } from "@/api/gen/src";
import { TestData } from "@/tests/src/accessors";
import { isExpoGoEnvironment } from "@/utils/misc.utils";
import React from "react";
import { Platform } from "react-native";
import { Heatmap } from "react-native-maps";

interface OHeatMapProps {
    showMap: boolean;
    locations: WeightedLatLngDTO[];
}

export const OHeatMap: React.FC<OHeatMapProps> = React.memo(
    ({ showMap, locations }) => {
        if (!showMap || isExpoGoEnvironment || !locations?.length) {
            return <></>;
        }

        // Use platform-specific radius
        const heatmapRadius = Platform.select({
            android: 50, // Android requires 10-50
            ios: 200, // iOS can handle larger values
            default: 50,
        });

        return (
            <Heatmap
                testID={TestData.encounters.heatMapComponent}
                points={locations}
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
