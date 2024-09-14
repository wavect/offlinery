import { Color } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { ReactNode } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import styles from "./OPageContainer.styles";

import { SSubtitle, STitle } from "@/styles/Text.styles";
import { MaterialIcons as MaterialIconsType } from "@expo/vector-icons";
type IconName = React.ComponentProps<typeof MaterialIconsType>["name"];

interface IOPageContainerProps {
    title?: string;
    subtitle?: string | ReactNode;
    children: ReactNode;
    bottomContainerChildren?: ReactNode;
    doNotUseScrollView?: boolean;
    fullpageIcon?: IconName;
}

export const OPageContainer = (props: IOPageContainerProps) => {
    const MainViewContainer = props.doNotUseScrollView ? View : ScrollView;
    const { width, height } = Dimensions.get("window");

    return (
        <View style={styles.container}>
            {props.fullpageIcon && (
                <View style={fullpageIconStyles.iconContainer}>
                    <MaterialIcons
                        name={props.fullpageIcon}
                        size={Math.min(width, height) * 0.8}
                        color={Color.brightestGray}
                    />
                </View>
            )}
            <MainViewContainer
                style={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {props.title && <STitle>{props.title}</STitle>}
                {props.subtitle && <SSubtitle>{props.subtitle}</SSubtitle>}
                {props.children}
            </MainViewContainer>

            <KeyboardAvoidingView
                style={styles.buttonContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
            >
                {props.bottomContainerChildren}
            </KeyboardAvoidingView>
        </View>
    );
};

const fullpageIconStyles = StyleSheet.create({
    iconContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: -1, // Place the icon behind other content
    },
});
