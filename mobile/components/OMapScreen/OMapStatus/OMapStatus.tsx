import { Color, FontFamily } from "@/GlobalStyles";
import { TR, i18n } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

export enum EMapStatus {
    LOADING_HEATMAP = "loading_heatmap",
    LOADING_LOCATION = "loading_location",
    SAVING_SAFEZONES = "saving_safezones",
    LIVE = "live",
    GHOST = "ghost",
}

interface IOMapStatus {
    status: EMapStatus;
}

export const OMapStatus = (props: IOMapStatus) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const { color, lbl } = {
        [EMapStatus.LOADING_HEATMAP]: {
            color: Color.lightOrange,
            lbl: i18n.t(TR.loadingHeatmap),
        },
        [EMapStatus.LOADING_LOCATION]: {
            color: Color.lightOrange,
            lbl: i18n.t(TR.loadingLocation),
        },
        [EMapStatus.SAVING_SAFEZONES]: {
            color: Color.lightOrange,
            lbl: i18n.t(TR.saving),
        },
        [EMapStatus.LIVE]: {
            color: Color.primary,
            lbl: i18n.t(TR.live),
        },
        [EMapStatus.GHOST]: {
            color: Color.schemesPrimary,
            lbl: i18n.t(TR.ghostMode),
        },
    }[props.status];

    useEffect(() => {
        if (props.status !== EMapStatus.GHOST) {
            const pulseAnimation = Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]);

            Animated.loop(pulseAnimation).start();

            return () => {
                scaleAnim.setValue(1);
            };
        }
    }, [props.status]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                }}
            >
                <MaterialIcons
                    name="radio-button-checked"
                    color={color}
                    size={12}
                />
            </Animated.View>
            <Text style={[styles.label, { color }]}>{lbl}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginLeft: 6,
        marginBottom: Platform.OS === "ios" ? 16 : 0,
    },
    label: {
        marginLeft: 6,
        fontFamily: FontFamily.montserratSemiBold,
    },
});
