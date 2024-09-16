import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OShowcase } from "@/components/OShowcase/OShowcase";
import { TR, i18n } from "@/localization/translate.service";
import { SplashContainerView } from "@/styles/View.styles";
import React from "react";

const Splash = () => {
    return (
        <OLinearBackground>
            <SplashContainerView>
                <OShowcase
                    subtitle={i18n.t(TR.datingAppsAreBroken)}
                    onlyUseSystemFont={true}
                />
            </SplashContainerView>
        </OLinearBackground>
    );
};

export default Splash;
