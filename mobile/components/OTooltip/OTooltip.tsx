import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface TooltipProps {
    tooltipText: string;
    iconSize?: number;
    iconColor?: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    style?: StyleProp<ViewStyle>;
}

export const OTooltip: React.FC<TooltipProps> = ({
    tooltipText,
    iconSize = 20,
    iconColor = "#999",
    iconName,
    style,
}) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const toggleTooltip = useCallback(() => {
        setIsTooltipVisible((prev) => !prev);
    }, []);

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity onPress={toggleTooltip} style={styles.icon}>
                <MaterialIcons
                    name={iconName}
                    size={iconSize}
                    color={iconColor}
                />
            </TouchableOpacity>
            <Modal
                transparent={true}
                visible={isTooltipVisible}
                onRequestClose={() => setIsTooltipVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsTooltipVisible(false)}
                >
                    <View style={styles.tooltipBubble}>
                        <Text style={styles.tooltipText}>{tooltipText}</Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    tooltipBubble: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        maxWidth: Dimensions.get("window").width * 0.8,
    },
    tooltipText: {
        fontSize: 14,
        color: "#333",
    },
});
