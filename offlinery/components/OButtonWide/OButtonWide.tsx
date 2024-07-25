import {Text, TouchableOpacity, View} from "react-native";
import * as React from "react";
import oButtonWideStyles from './OButtonWide.styles'
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";

interface IOButtonWideProps {
    text: string
    /** @dev Filled or outlined button? */
    filled: boolean
    onPress?: ((event: GestureResponderEvent) => void);
}

export const OButtonWide = (props: IOButtonWideProps) => {
    return <TouchableOpacity
            onPress={props.onPress}
            style={[props.filled ? oButtonWideStyles.buttonFilled : oButtonWideStyles.buttonOutlined, oButtonWideStyles.button]}>
            <View style={[oButtonWideStyles.btnStateLayer, oButtonWideStyles.button]}>
                <Text
                    style={props.filled ? oButtonWideStyles.btnFilledLbl : oButtonWideStyles.btnOutlineLbl}>{props.text.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
}