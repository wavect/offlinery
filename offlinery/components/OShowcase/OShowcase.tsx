import {Image, Text, View} from "react-native";
import * as React from "react";
import oShowcaseStyles from './OShowcase.styles'

interface IOShowcaseProps {
    subtitle: string;
}

export const OShowcase = (props: IOShowcaseProps) => {
    return <>
        <View style={oShowcaseStyles.headlineContainer}>
            <Image
                style={[oShowcaseStyles.icon, oShowcaseStyles.headlinePosition]}
                resizeMode="cover"
                source={require("../../assets/img/no-wifi.svg")}
            />
            <Text style={[oShowcaseStyles.headlineText, oShowcaseStyles.headlinePosition]}>
                offlinery
            </Text>
        </View>
        <Text style={[oShowcaseStyles.subtitle, oShowcaseStyles.offlineryFlexBox]}>
            {props.subtitle}
        </Text>
    </>
}