import { OPageHeader } from "@/components/OPageHeader/OPageHeader";
import {
    EACTION_ENCOUNTERS,
    useEncountersContext,
} from "@/context/EncountersContext";
import { i18n, TR } from "@/localization/translate.service";
import { getLocalValue, LOCAL_VALUE } from "@/services/storage.service";
import * as Sentry from "@sentry/react-native";
import * as React from "react";
import { useEffect, useState } from "react";

export const OPageHeaderEncounters = () => {
    const { dispatch: dispatchEncounters } = useEncountersContext();

    const [hasDoneEncounterWalkthrough, setHasDoneEncounterWalkthrough] =
        useState(true);

    useEffect(() => {
        getLocalValue(LOCAL_VALUE.HAS_DONE_ENCOUNTER_WALKTHROUGH)
            .then((value) => {
                setHasDoneEncounterWalkthrough(value);
            })
            .catch((err: any) => {
                Sentry.captureException(err, {
                    tags: {
                        pageHeaderEncounters:
                            "getLocalValue:hasDoneEncounterWalkthrough",
                    },
                });
            });
    }, []);

    return (
        <OPageHeader
            title={i18n.t(TR.encounters)}
            highlightHelpBtn={!hasDoneEncounterWalkthrough}
            onHelpPress={() => {
                dispatchEncounters({
                    type: EACTION_ENCOUNTERS.SET_IS_WALKTHROUGH_RUNNING,
                    payload: true,
                });
            }}
        />
    );
};
