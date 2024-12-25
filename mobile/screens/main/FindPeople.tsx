import { OMap } from "@/components/OMap/OMap";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
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
        <OPageContainer subtitle={i18n.t(TR.beNearTheseHotspotsToMeet)}>
            <OMap
                saveChangesToBackend={true}
                showHeatmap={true}
                showBlacklistedRegions={true}
            />
        </OPageContainer>
    );
};

export default FindPeople;
