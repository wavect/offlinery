import {Text, TouchableOpacity, View} from "react-native";
import * as React from "react";
import oButtonWideStyles from './OButtonWide.styles'
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface IOButtonWideProps {
    text: string
    /** @dev Filled or outlined button? */
    filled: boolean
    onPress?: ((event: GestureResponderEvent) => void);
    style?: StyleProp<ViewStyle>
}

export const OButtonWide = (props: IOButtonWideProps) => {
    return <TouchableOpacity
            onPress={props.onPress}
            style={[props.filled ? oButtonWideStyles.buttonFilled : oButtonWideStyles.buttonOutlined, oButtonWideStyles.button, props.style]}>
                <Text
                    style={props.filled ? oButtonWideStyles.btnFilledLbl : oButtonWideStyles.btnOutlineLbl}>{props.text.toUpperCase()}</Text>
        </TouchableOpacity>
}