import { TR, i18n } from "@/localization/translate.service";
import { StyledLink } from "@/styles/Miscellaneous.styles";
import { SUPPORT_MAIL } from "@/utils/general.constants";
import * as React from "react";
import { Linking } from "react-native";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface IOTroubleSignIn {
    style?: StyleProp<TextStyle>;
}

export const OTroubleSignIn = (props: IOTroubleSignIn) => {
    const writeSupportEmail = async () => {
        await Linking.openURL(`mailto:${SUPPORT_MAIL}`);
    };

    return (
        <StyledLink marginTop={16} onPress={writeSupportEmail}>
            {i18n.t(TR.troubleSignIn)}
        </StyledLink>
    );
};
