import { styles } from "@/components/OButtonSmall/OButtonSmall.styles";
import * as React from "react";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    Text,
    View,
    ViewStyle,
} from "react-native";

interface IOButtonSmallProps {
    onPress: () => Promise<void> | void;
    label: string;
    isDisabled?: boolean;
    variant?: IOButtonSmallVariant;
    containerStyle?: StyleProp<ViewStyle>;
}

export enum IOButtonSmallVariant {
    Danger = "buttonDanger",
    Black = "buttonBlack",
}

export const OButtonSmall = (props: IOButtonSmallProps) => {
    const { onPress, label, isDisabled, variant, containerStyle } = props;
    const [isLoading, setLoading] = useState(false);

    const wrappedOnPress = async () => {
        setLoading(true);
        try {
            await onPress();
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const buttonStyle = isDisabled
        ? styles.buttonDisabled
        : styles[variant ?? "buttonBlack"];
    return (
        <Pressable
            style={[styles.buttonBase, buttonStyle, containerStyle]}
            onPress={wrappedOnPress}
            disabled={isDisabled || isLoading}
        >
            <View style={styles.contentContainer}>
                {isLoading && (
                    <ActivityIndicator
                        size="small"
                        color={styles.buttonText.color}
                        style={styles.activityIndicator}
                    />
                )}
                <Text style={styles.buttonText}>{label}</Text>
            </View>
        </Pressable>
    );
};
