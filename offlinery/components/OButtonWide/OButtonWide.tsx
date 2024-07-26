import {Pressable, Text, View} from "react-native";
import * as React from "react";
import oButtonWideStyles from './OButtonWide.styles'
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

type StyleVariant = "dark" | "light"

interface IOButtonWideProps {
    text: string
    /** @dev Filled or outlined button? */
    filled: boolean
    variant: StyleVariant
    onPress?: ((event: GestureResponderEvent) => void);
    style?: StyleProp<ViewStyle>;
    disabled?: boolean
}

const getStyle = (disabled: boolean, el: "btn" | "lbl", filled: boolean, variant: StyleVariant) => {
    if (el === "btn") {
        if (filled) {
            if (disabled) {
                return oButtonWideStyles.buttonFilledDisabled
            } else if (variant === "dark") {
                // btn, filled, dark
                return oButtonWideStyles.buttonFilledDark
            } else {
                // btn, filled, light
                return oButtonWideStyles.buttonFilledLight
            }
        } else {
            if (disabled) {
                return oButtonWideStyles.buttonOutlinedDisabled
            } else if (variant === "dark") {
                // btn, outlined, dark
                return oButtonWideStyles.buttonOutlinedDark
            } else {
                // btn, outlined, light
                return oButtonWideStyles.buttonOutlinedLight
            }
        }
    } else {
        if (filled) {
            if (variant === "dark") {
                // lbl, filled, dark
                return oButtonWideStyles.btnFilledLabelDark
            } else {
                // lbl, filled, light
                return oButtonWideStyles.btnFilledLabelLight
            }
        } else {
            if (variant === "dark") {
                // lbl, outlined, dark
                return oButtonWideStyles.btnOutlineLabelDark
            } else {
                // lbl, outlined, light
                return oButtonWideStyles.btnOutlineLabelLight
            }
        }
    }
}

export const OButtonWide = (props: IOButtonWideProps) => {
    return <Pressable
        onPress={props.onPress}
        disabled={props.disabled}
        style={[getStyle(props.disabled, "btn", props.filled, props.variant), oButtonWideStyles.button, props.style]}>
        <Text
            style={getStyle(props.disabled, "lbl", props.filled, props.variant)}>{props.text.toUpperCase()}</Text>
    </Pressable>
}