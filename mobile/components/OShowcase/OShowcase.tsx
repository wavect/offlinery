import { Color } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { Text, View } from "react-native";
import oShowcaseStyles from "./OShowcase.styles";

interface IOShowcaseProps {
    subtitle: string;
    /** @dev If true Montserrat won't be used. This is useful for e.g. the Splash screen when remote fonts are not yet loaded. */
    onlyUseSystemFont?: boolean;
}

export const OShowcase = (props: IOShowcaseProps) => {
    const { onlyUseSystemFont } = props;
    // use default fonts, override to use none
    const systemFontStyle = onlyUseSystemFont
        ? { fontFamily: undefined }
        : null;
    return (
        <>
            <View style={oShowcaseStyles.headlineContainer}>
                <MaterialIcons name="wifi-off" size={45} color={Color.white} />
                <Text style={[oShowcaseStyles.headlineText, systemFontStyle]}>
                    offlinery
                </Text>
            </View>
            <Text
                style={[
                    oShowcaseStyles.subtitle,
                    oShowcaseStyles.offlineryFlexBox,
                    systemFontStyle,
                ]}
            >
                {props.subtitle}
            </Text>
        </>
    );
};
