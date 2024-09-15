import { TR, i18n } from "@/localization/translate.service";
import { SText } from "@/styles/Text.styles";
import * as React from "react";
import { Linking } from "react-native";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { TextStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface IOTroubleSignIn {
    style?: StyleProp<TextStyle>;
}

export const OTroubleSignIn = (props: IOTroubleSignIn) => {
    const writeSupportEmail = async () => {
        await Linking.openURL("mailto:office@wavect.io");
    };

    return (
        <SText.Small white onPress={writeSupportEmail}>
            {i18n.t(TR.troubleSignIn)}
        </SText.Small>
    );
};
