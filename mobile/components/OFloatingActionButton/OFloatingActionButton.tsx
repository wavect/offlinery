import { Color } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

const positionDistance = 0.01;

interface OFloatingActionButtonProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    action: () => void;
    color: string;
    style?: ViewStyle;
    position?: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "right";
    size: "md" | "xs";
}

const { width, height } = Dimensions.get("window");

export const OFloatingActionButton: React.FC<OFloatingActionButtonProps> = ({
    icon,
    size,
    action,
    color,
    style,
    position = "bottomRight",
}) => {
    const getPositionStyle = (): ViewStyle => {
        switch (position) {
            case "right":
                return {
                    right: width * positionDistance,
                };
            case "bottomRight":
                return {
                    bottom: height * positionDistance,
                    right: width * positionDistance,
                };
            case "bottomLeft":
                return {
                    bottom: height * positionDistance,
                    left: width * positionDistance,
                };
            case "topRight":
                return {
                    top: height * positionDistance,
                    right: width * positionDistance,
                };
            case "topLeft":
                return {
                    top: height * positionDistance,
                    left: width * positionDistance,
                };
        }
    };

    const getBtnSizeStyle = (): ViewStyle => {
        switch (size) {
            case "md":
                return styles.btnMd;
            case "xs":
                return styles.btnXs;
        }
    };

    const getIconSize = (): number => {
        switch (size) {
            case "md":
                return 40;
            case "xs":
                return 30;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getBtnSizeStyle(),
                getPositionStyle(),
                { backgroundColor: color },
                style,
            ]}
            onPress={action}
            activeOpacity={0.8}
        >
            <MaterialIcons
                name={icon}
                size={getIconSize()}
                color={Color.white}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40,
        position: "absolute",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    btnMd: {
        width: 65,
        height: 65,
    },
    btnXs: {
        width: 50,
        height: 50,
    },
});
