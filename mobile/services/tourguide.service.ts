import {
    EncounterPublicDTO,
    UserPublicDTOIntentionsEnum,
    WeightedLatLngDTO,
} from "@/api/gen/src";

export enum TOURKEY {
    FIND = "find",
    ENCOUNTERS = "encounters",
}

export const MOCK_HEATMAP_LOCATIONS: (
    mapRegion: WeightedLatLngDTO,
) => WeightedLatLngDTO[] = (mapRegion) => [
    {
        latitude: mapRegion.latitude * 1.0001,
        longitude: mapRegion.longitude * 1.0001,
    },
    {
        latitude: mapRegion.latitude * 1.0005,
        longitude: mapRegion.longitude * 1.0005,
    },
    {
        latitude: mapRegion.latitude * 1.0004,
        longitude: mapRegion.longitude * 1.0004,
    },
    {
        latitude: mapRegion.latitude * 1.0003,
        longitude: mapRegion.longitude * 1.0005,
    },
    {
        latitude: mapRegion.latitude * 1.00045,
        longitude: mapRegion.longitude * 1.0005,
    },
    {
        latitude: mapRegion.latitude * 1.00046,
        longitude: mapRegion.longitude * 1.0005,
    },
    {
        latitude: mapRegion.latitude * 1.00045,
        longitude: mapRegion.longitude * 1.00052,
    },
    {
        latitude: mapRegion.latitude * 1.000451,
        longitude: mapRegion.longitude * 1.00051,
    },
    {
        latitude: mapRegion.latitude * 1.0006,
        longitude: mapRegion.longitude * 1.0003,
    },
    {
        latitude: mapRegion.latitude * 1.001,
        longitude: mapRegion.longitude * 1.001,
    },
    {
        latitude: mapRegion.latitude * 1.0012,
        longitude: mapRegion.longitude * 1.0012,
    },
];

export const MOCK_ENCOUNTER = (
    override: Partial<EncounterPublicDTO> | null,
): EncounterPublicDTO => {
    return {
        id: "0",
        amountStrikes: 1,
        isNearbyRightNow: false,
        messages: [],
        reported: false,
        otherUser: {
            id: "abc",
            bio: "Example user",
            age: 27,
            firstName: "Lisa",
            imageURIs: [
                "https://blog.offlinery.io/blogs/get-approached-as-women-e588a97a.jpg",
            ],
            intentions: [
                UserPublicDTOIntentionsEnum.friendship,
                UserPublicDTOIntentionsEnum.casual,
                UserPublicDTOIntentionsEnum.relationship,
            ],
        },
        lastDateTimePassedBy: new Date().toISOString(),
        lastLocationPassedBy: "Innsbruck",
        status: "not_met",
        ...override,
    };
};
