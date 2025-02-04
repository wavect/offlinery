import { Meta, Story } from "@storybook/react";
import React from "react";
import { EMapStatus } from "../enums/EMapStatus"; // Enum für Statuswerte
import { MapViewComponent, MapViewComponentProps } from "../MapViewComponent"; // Die zu testende Hauptkomponente

// Beispiel-Daten für das Storybook
const Default = {
    showMapStatus: true,
    mapStatus: EMapStatus.Loaded, // Standardwert für MapView
    encounterState: { encounters: [] },
    userCount: 0,
    showEncounters: true,
    showHeatmap: true,
    showBlacklistedRegions: false,
    activeRegionIndex: null,
    mapRegion: { latitude: 52.52, longitude: 13.405 }, // Beispiel für Berlin
    handleMapPress: () => {},
    handleMapLongPress: () => {},
    handleRegionPress: () => {},
    handleRadiusChange: () => {},
    handleRemoveRegion: () => {},
};

// Story für den "Loading"-Zustand der Map
export const MapLoadingState: Story<MapViewComponentProps> = (args) => (
    <MapViewComponent {...args} />
);
MapLoadingState.args = {
    ...Default,
    mapStatus: EMapStatus.Loading, // Zeigt den Ladezustand an
    encounterState: { encounters: [] },
    userCount: 0,
    showEncounters: true,
    showHeatmap: false, // Heatmap ausblenden, während der Ladezustand aktiv ist
};

// Story für den "Loaded"-Zustand der Map
export const MapLoadedState: Story<MapViewComponentProps> = (args) => (
    <MapViewComponent {...args} />
);
MapLoadedState.args = {
    ...Default,
    mapStatus: EMapStatus.Loaded, // Zeigt den geladenen Zustand an
    encounterState: {
        encounters: [
            {
                id: 1,
                location: { latitude: 52.52, longitude: 13.405 },
                startDate: "2025-02-05",
                startTime: "10:00",
                endTime: "12:00",
            },
        ],
    },
    userCount: 15, // Beispielbenutzerzahl
    showEncounters: true,
    showHeatmap: true,
    showBlacklistedRegions: false,
};

// Story für den "Error"-Zustand der Map
export const MapErrorState: Story<MapViewComponentProps> = (args) => (
    <MapViewComponent {...args} />
);
MapErrorState.args = {
    ...Default,
    mapStatus: EMapStatus.Error, // Fehlerzustand für die Map
    encounterState: { encounters: [] },
    userCount: 0,
    showEncounters: true,
    showHeatmap: false,
    showBlacklistedRegions: false,
};

// Eine Story für den Fall, dass keine Begegnungen vorhanden sind
export const MapNoEncounters: Story<MapViewComponentProps> = (args) => (
    <MapViewComponent {...args} />
);
MapNoEncounters.args = {
    ...Default,
    mapStatus: EMapStatus.Loaded,
    encounterState: { encounters: [] }, // Keine Begegnungen auf der Karte
    userCount: 5,
    showEncounters: true,
    showHeatmap: true,
    showBlacklistedRegions: false,
};

// Eine Story für den Fall, dass Heatmap aktiv ist
export const MapWithHeatmap: Story<MapViewComponentProps> = (args) => (
    <MapViewComponent {...args} />
);
MapWithHeatmap.args = {
    ...Default,
    mapStatus: EMapStatus.Loaded,
    encounterState: {
        encounters: [
            {
                id: 1,
                location: { latitude: 52.52, longitude: 13.405 },
                startDate: "2025-02-05",
                startTime: "10:00",
                endTime: "12:00",
            },
        ],
    },
    userCount: 10,
    showEncounters: true,
    showHeatmap: true, // Heatmap aktiv
    showBlacklistedRegions: false,
};

// Story für die Anzeige der gesperrten Regionen
export const MapWithBlacklistedRegions: Story<MapViewComponentProps> = (
    args,
) => <MapViewComponent {...args} />;
MapWithBlacklistedRegions.args = {
    ...Default,
    mapStatus: EMapStatus.Loaded,
    encounterState: {
        encounters: [
            {
                id: 1,
                location: { latitude: 52.52, longitude: 13.405 },
                startDate: "2025-02-05",
                startTime: "10:00",
                endTime: "12:00",
            },
        ],
    },
    userCount: 10,
    showEncounters: true,
    showHeatmap: true,
    showBlacklistedRegions: true, // Zeigt die gesperrten Regionen an
    activeRegionIndex: 0, // Beispiel für eine aktive gesperrte Region
};

// Story für den Fall, dass der Benutzer 0 Begegnungen hat
export const MapWithNoUserEncounters: Story<MapViewComponentProps> = (args) => (
    <MapViewComponent {...args} />
);
MapWithNoUserEncounters.args = {
    ...Default,
    mapStatus: EMapStatus.Loaded,
    encounterState: { encounters: [] }, // Keine Begegnungen
    userCount: 0,
    showEncounters: true,
    showHeatmap: false,
    showBlacklistedRegions: false,
};

// Meta-Informationen zu unserer MapViewComponent
export default {
    title: "Map/MapViewComponent", // Titel der Story im Storybook
    component: MapViewComponent, // Die zu testende Komponente
    argTypes: {
        mapStatus: {
            options: Object.values(EMapStatus),
            control: { type: "radio" },
        },
        showEncounters: {
            control: { type: "boolean" },
        },
        showHeatmap: {
            control: { type: "boolean" },
        },
        showBlacklistedRegions: {
            control: { type: "boolean" },
        },
        activeRegionIndex: {
            control: { type: "number" },
        },
        encounterState: {
            control: "object", // Kontrolle über das "encounterState"-Objekt
        },
        userCount: {
            control: { type: "number" },
        },
        mapRegion: {
            control: "object", // Kontrolle über die Karte (Position)
        },
    },
    args: Default, // Standard-Props
} as Meta;
