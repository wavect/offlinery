import { EncounterPublicDTOStatusEnum } from "@/api/gen/src";
import { i18n, TR } from "@/localization/translate.service";

export const dateStateConfig = [
    {
        label: i18n.t(TR.encounterInterest.notMet),
        value: EncounterPublicDTOStatusEnum.not_met,
        testID: "dropdown-option-not-met",
    },
    {
        label: i18n.t(TR.encounterInterest.metNotInterested),
        value: EncounterPublicDTOStatusEnum.met_not_interested,
        testID: "dropdown-option-met-not-interested",
    },
    {
        label: i18n.t(TR.encounterInterest.metInterested),
        value: EncounterPublicDTOStatusEnum.met_interested,
        testID: "dropdown-option-met-interested",
    },
];
