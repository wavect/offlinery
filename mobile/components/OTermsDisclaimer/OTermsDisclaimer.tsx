import { TR, i18n } from "@/localization/translate.service";
import {
    TermsContainerOuter,
    TermsLink,
    TermsText,
} from "@/styles/View.styles";
import { A } from "@expo/html-elements";
import React from "react";

export const OTermsDisclaimer: React.FC = () => {
    return (
        <TermsContainerOuter>
            <TermsText>
                {i18n.t(TR.termsDisclaimer.p1)}
                <A href="https://wavect.io/imprint">
                    <TermsLink>{i18n.t(TR.termsDisclaimer.terms)}</TermsLink>
                </A>
                {i18n.t(TR.termsDisclaimer.p2)}
                <A href="https://wavect.io/imprint">
                    <TermsLink>
                        {i18n.t(TR.termsDisclaimer.privacyCookie)}
                    </TermsLink>
                </A>
            </TermsText>
        </TermsContainerOuter>
    );
};
