import React from "react";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

import { MainStackParamList } from "@/MainStack.navigator";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OMap } from "@/components/OMap/OMap";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { saveOnboardingState } from "@/utils/misc.utils";
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
        saveOnboardingState(state, ROUTES.Onboarding.DontApproachMeHere);
    }, []);

    return (
        <OPageContainer
            subtitle={i18n.t(TR.whatAreSpotsToNotApproachYou)}
            bottomContainerChildren={
                <OButtonWide
                    text={i18n.t(TR.continue)}
                    filled={true}
                    variant="dark"
                    onPress={() =>
                        navigation.navigate(ROUTES.Onboarding.ApproachMeBetween)
                    }
                />
            }
        >
            <OMap
                saveChangesToBackend={false}
                showHeatmap={false}
                showBlacklistedRegions={true}
            />
        </OPageContainer>
    );
};

export default DontApproachMeHere;
