import OMapScreen from "@/components/OMapScreen/OMapScreen";
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
    return (
        <OMapScreen
            subtitle={i18n.t(TR.beNearTheseHotspotsToMeet)}
            subtitle2={i18n.t(TR.safeZonesToHide)}
            showHeatmap={true}
            showBlacklistedRegions={true}
            saveChangesToBackend={true}
        />
    );
};

export default FindPeople;
