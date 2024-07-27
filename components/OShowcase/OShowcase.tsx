import {Text, View} from "react-native";
import * as React from "react";
import oShowcaseStyles from './OShowcase.styles'
import { MaterialIcons } from '@expo/vector-icons';
import {Color} from "../../GlobalStyles";

interface IOShowcaseProps {
    subtitle: string;
}

export const OShowcase = (props: IOShowcaseProps) => {
    return <>
        <View style={oShowcaseStyles.headlineContainer}>
            <MaterialIcons name="wifi-off" size={45} color={Color.white} />
            <Text style={oShowcaseStyles.headlineText}>
                offlinery
            </Text>
        </View>
        <Text style={[oShowcaseStyles.subtitle, oShowcaseStyles.offlineryFlexBox]}>
            {props.subtitle}
        </Text>
    </>
}