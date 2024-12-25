import { getLocalValue, LOCAL_VALUE } from "@/services/storage.service";
import { TOURKEY } from "@/services/tourguide.service";
import { useEffect } from "react";
import { useTourGuideController } from "rn-tourguide";

/** @dev Right now specifically made for MainScreenTabs but moved into hook for separation of concerns. */
export const useSetupTourGuides = () => {
    const {
        canStart: canStartTourFind,
        start: startTourFind,
        tourKey: tourKeyFind,
    } = useTourGuideController(TOURKEY.FIND);
    const {
        canStart: canStartTourEncounter,
        start: startTourEncounter,
        tourKey: tourKeyEncounter,
    } = useTourGuideController(TOURKEY.ENCOUNTERS);

    useEffect(() => {
        getLocalValue(LOCAL_VALUE.HAS_DONE_FIND_WALKTHROUGH).then(
            (hasDoneWalkthrough) => {
                if (hasDoneWalkthrough?.toLowerCase().trim() === "true") return;
                if (canStartTourFind) {
                    startTourFind();
                }
            },
        );
    }, [canStartTourFind]);

    useEffect(() => {
        // only called when clicked
        if (canStartTourEncounter) {
            startTourEncounter();
        }
    }, [canStartTourEncounter]);

    return {
        canStartTourFind,
        canStartTourEncounter,
        startTourFind,
        startTourEncounter,
        tourKeyFind,
        tourKeyEncounter,
    };
};
