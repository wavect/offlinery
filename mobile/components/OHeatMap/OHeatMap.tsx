import { WeightedLatLngDTO } from "@/api/gen/src";
import { TestData } from "@/tests/src/accessors";
import { isExpoGoEnvironment } from "@/utils/misc.utils";
import React from "react";
import { Heatmap } from "react-native-maps";

interface OHeatMapProps {
    showMap: boolean;
    locations: WeightedLatLngDTO[];
}

export const OHeatMap: React.FC<OHeatMapProps> = React.memo(
    ({ showMap, locations }) => {
        if (!showMap || isExpoGoEnvironment || locations?.length) {
            return <></>;
        }

        return (
            <Heatmap
                testID={TestData.encounters.heatMapComponent}
                points={locations}
                opacity={0.5}
                radius={350}
                gradient={{
                    colors: ["blue", "green", "yellow", "red"],
                    startPoints: [0.01, 0.25, 0.5, 0.75],
                    colorMapSize: 256,
                }}
            />
        );
    },
);
