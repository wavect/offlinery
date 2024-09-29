import { OMapRefType } from "@/components/OMap/OMap";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { TR, i18n } from "@/localization/translate.service";
import { MainScreenTabsParamList } from "@/screens/main/MainScreenTabs.navigator";
import { ROUTES } from "@/screens/routes";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { useRef } from "react";
import { Text } from "react-native";

const FindPeople = (
    props: BottomTabScreenProps<
        MainScreenTabsParamList,
        typeof ROUTES.MainTabView
    >,
) => {
    const oMapRef = useRef<OMapRefType>(null);

    return (
        <OPageContainer
            subtitle={i18n.t(TR.beNearTheseHotspotsToMeet)}
            refreshFunc={oMapRef.current?.getOtherUsersPositions}
        >
            <Text>test</Text>
        </OPageContainer>
    );
};

export default FindPeople;
