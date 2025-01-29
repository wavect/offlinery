import { LocationDTO } from "@/DTOs/location.dto";
import { Point } from "geojson";

export const getTypedCoordinatesFromPoint = (point: Point): LocationDTO => {
    return {
        longitude: point.coordinates[0],
        latitude: point.coordinates[1],
    };
};

export const getPointFromTypedCoordinates = (location: LocationDTO): Point => {
    return {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
    };
};
