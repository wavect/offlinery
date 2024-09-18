import { Color, Subtitle, Title } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import { ReactNode, useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import styles from "./OPageContainer.styles";

import { MaterialIcons as MaterialIconsType } from "@expo/vector-icons";
type IconName = React.ComponentProps<typeof MaterialIconsType>["name"];

interface IOPageContainerProps {
    title?: string;
    subtitle?: string | ReactNode;
    children: ReactNode;
    bottomContainerChildren?: ReactNode;
    doNotUseScrollView?: boolean;
    fullpageIcon?: IconName;
    refreshFunc?: () => Promise<void>;
}

export const OPageContainer = (props: IOPageContainerProps) => {
    const { doNotUseScrollView, refreshFunc } = props;

    const MainViewContainer = doNotUseScrollView ? View : ScrollView;
    const { width, height } = Dimensions.get("window");
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshFunc!();
        setRefreshing(false);
    };

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
                refreshControl={
                    refreshFunc && (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    )
                }
            >
                {props.title && <Text style={Title}>{props.title}</Text>}
                {props.subtitle && (
                    <Text style={Subtitle}>{props.subtitle}</Text>
                )}
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
