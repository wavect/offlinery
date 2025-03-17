import { EncounterPublicDTO } from "@/api/gen/src";
import OEncounter from "@/components/OEncounter/OEncounter";
import { MOCK_ENCOUNTER, TOURKEY } from "@/services/tourguide.service";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTourGuideController } from "rn-tourguide";

/// @dev For cleaner code and due to render/component lifecycle issues.
export const OTourEncounter = ({ navigation }: any) => {
    const tourInitialized = useRef(false);
    const [encounter, setEncounter] = useState<EncounterPublicDTO>(
        MOCK_ENCOUNTER(null),
    );
    const handleTourOnStepChange = useCallback(
        (e: any) => {
            if (e?.order === 2) {
                setEncounter(MOCK_ENCOUNTER({ status: "met_interested" }));
            } else if (e?.order === 3) {
                setEncounter(
                    MOCK_ENCOUNTER({
                        status: "met_interested",
                        messages: [
                            {
                                id: "44",
                                content:
                                    "Forgot to drop my number :), +43 xxxxxxx",
                                senderUserId: "abc",
                                sentAt: new Date().toISOString(),
                            },
                        ],
                    }),
                );
            } else if (e?.order === 4) {
                setEncounter(MOCK_ENCOUNTER({ status: "met_not_interested" }));
            } else if (e?.order === 5) {
                setEncounter(MOCK_ENCOUNTER({ status: "not_met" }));
            } else if (e?.order === 6) {
                // @dev revert to order4 state "previous" button would otherwise keep the 7th state.
                setEncounter(MOCK_ENCOUNTER({ status: "not_met" }));
            } else if (e?.order === 7) {
                setEncounter(
                    MOCK_ENCOUNTER({
                        status: "met_interested",
                        isNearbyRightNow: true,
                    }),
                );
            }
        },
        [setEncounter],
    );

    const {
        eventEmitter,
        canStart: canStartTourEncounters,
        start: startTourEncounters,
    } = useTourGuideController(TOURKEY.ENCOUNTERS);

    useEffect(() => {
        if (!eventEmitter) return;
        eventEmitter?.on("stepChange", handleTourOnStepChange);

        return () => {
            eventEmitter?.off("stepChange", handleTourOnStepChange);
        };
        // @dev Keep mapRegion in dependency to mock heatmap along current mapRegion
    }, [eventEmitter]);

    useEffect(() => {
        if (canStartTourEncounters && !tourInitialized.current) {
            requestAnimationFrame(() => {
                startTourEncounters();
                tourInitialized.current = true;
            });
        }
    }, [canStartTourEncounters, startTourEncounters, tourInitialized]);

    return (
        <OEncounter
            encounterProfile={encounter}
            showActions={true}
            navigation={navigation}
        />
    );
};
