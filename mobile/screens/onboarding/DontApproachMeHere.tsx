import React from "react";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import OMapScreen from "@/components/OMapScreen/OMapScreen";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/services/storage.service";
import { ROUTES } from "../routes";

type DontApproachMeHereProps = NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.DontApproachMeHere
>;

const DontApproachMeHere: React.FC<DontApproachMeHereProps> = ({
    navigation,
}) => {
    const { state } = useUserContext();

    React.useEffect(() => {
        saveOnboardingState(state, navigation.getState());
    }, []);

    return (
        <OMapScreen
            subtitle={i18n.t(TR.whatAreSpotsToNotApproachYou)}
            showHeatmap={false}
            showMapStatus={false}
            showBlacklistedRegions={true}
            saveChangesToBackend={false}
            bottomChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.ApproachMeBetween)
                    }
                />
            }
        />
    );
};

export default DontApproachMeHere;
