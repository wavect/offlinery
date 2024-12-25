import { EACTION_USER, MapRegion, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import React, { useCallback, useState } from "react";
import { Circle, Marker, MarkerDragStartEndEvent } from "react-native-maps";

interface IOBlacklistedRegionProps {
    isSelected: boolean;
    region: MapRegion;
    handleRegionPress: (region: MapRegion) => void;
}

export const OBlacklistedRegion = (props: IOBlacklistedRegionProps) => {
    const { isSelected, region, handleRegionPress } = props;
    const { state, dispatch } = useUserContext();
    const [isDragging, setDragging] = useState<boolean>(false);

    const handleRegionDragStart = useCallback(() => {
        setDragging(true);
    }, []);

    const handleRegionDragEnd = (event: MarkerDragStartEndEvent) => {
        if (isDragging) {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            const newRegions = state.blacklistedRegions.map(
                (currRegion, index) =>
                    region === currRegion
                        ? { ...currRegion, latitude, longitude }
                        : currRegion,
            );
            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { blacklistedRegions: newRegions },
            });
        }
        setDragging(false);
    };

    return (
        <>
            <Circle
                center={region}
                radius={region?.radius}
                fillColor={
                    isSelected ? "rgba(255, 0, 0, 0.4)" : "rgba(255, 0, 0, 0.2)"
                }
                strokeColor={
                    isSelected ? "rgba(255, 0, 0, 0.8)" : "rgba(255, 0, 0, 0.5)"
                }
            />
            <Marker
                coordinate={region}
                title={i18n.t(TR.youAreUndercover)}
                description={i18n.t(TR.nobodyWillSeeYou)}
                draggable={true}
                onDragStart={handleRegionDragStart}
                onDragEnd={handleRegionDragEnd}
                onPress={() => handleRegionPress(region)}
                tracksViewChanges={false}
            />
        </>
    );
};
