import { UserPrivateDTODateModeEnum } from "@/api/gen/src";
import OMapScreen from "@/components/OMapScreen/OMapScreen";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { MainScreenTabsParamList } from "@/screens/main/MainScreenTabs.navigator";
import { ROUTES } from "@/screens/routes";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as React from "react";

const FindPeople = (
    props: BottomTabScreenProps<
        MainScreenTabsParamList,
        typeof ROUTES.MainTabView
    >,
) => {
    const { state } = useUserContext();
    return (
        <OMapScreen
            subtitle={
                state.dateMode === UserPrivateDTODateModeEnum.live
                    ? i18n.t(TR.beNearTheseHotspotsToMeet)
                    : i18n.t(TR.turnOnLiveMode)
            }
            subtitle2={i18n.t(TR.safeZonesToHide)}
            showHeatmap={true}
            showingBottomButton={false}
            showEncounters={true}
            showEvents={true}
            showMapStatus={true}
            showBlacklistedRegions={true}
            saveChangesToBackend={true}
        />
    );
};

export default FindPeople;
