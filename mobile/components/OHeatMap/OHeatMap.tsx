import { WeightedLatLngDTO } from "@/api/gen/src";
import React from "react";
import { Heatmap } from "react-native-maps";

interface OHeatMapProps {
    locations: WeightedLatLngDTO[];
}

export const OHeatMap: React.FC<OHeatMapProps> = React.memo(({ locations }) => {
    return (
        <Heatmap
            points={locations}
            opacity={0.5}
            radius={100}
            gradient={{
                colors: ["blue", "green", "yellow", "red"],
                startPoints: [0.01, 0.25, 0.5, 0.75],
                colorMapSize: 256,
            }}
        />
    );
});
