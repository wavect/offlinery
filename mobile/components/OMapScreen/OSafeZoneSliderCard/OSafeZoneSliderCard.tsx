import { BorderRadius, Color, FontSize, Subtitle } from "@/GlobalStyles";
import OCard from "@/components/OCard/OCard";
import { OFloatingActionButton } from "@/components/OFloatingActionButton/OFloatingActionButton";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import Slider from "@react-native-community/slider";
import React from "react";
import {
    Dimensions,
    Platform,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IOSafeZoneSliderCardProps {
    handleRadiusChange: (value: number) => void;
    handleRemoveRegion: () => void;
    activeRegionIndex: number;
    sliderValue: number;
    containerStyle: StyleProp<ViewStyle>;
}

export const OSafeZoneSliderCard = ({
    handleRadiusChange,
    handleRemoveRegion,
    activeRegionIndex,
    sliderValue,
    containerStyle,
}: IOSafeZoneSliderCardProps) => {
    const { state } = useUserContext();
    return (
        <View
            style={[styles.sliderOverlayContainer, containerStyle]}
            pointerEvents="box-none"
        >
            <SafeAreaView
                edges={["bottom", "right", "left"]}
                style={styles.sliderSafeArea}
                pointerEvents="box-none"
            >
                <View style={styles.sliderWrapper} pointerEvents="box-none">
                    <OCard
                        style={[
                            styles.controlsCard,
                            Platform.OS === "android" &&
                                styles.androidControlsCard,
                        ]}
                    >
                        <View
                            pointerEvents="auto"
                            onPointerDown={handleRemoveRegion}
                            style={styles.fabContainer}
                        >
                            <OFloatingActionButton
                                size="xs"
                                icon="delete-outline"
                                position="right"
                                action={handleRemoveRegion}
                                color={Color.red}
                            />
                        </View>
                        <View style={styles.controlsHeader}>
                            <Text style={[Subtitle, styles.sliderText]}>
                                {i18n.t(TR.adjustRegionRadius)} (
                                {Math.round(
                                    state.blacklistedRegions[activeRegionIndex]
                                        ?.radius,
                                )}
                                m)
                            </Text>
                        </View>
                        <View
                            style={styles.sliderContainer}
                            pointerEvents="auto"
                        >
                            <Slider
                                style={[
                                    styles.slider,
                                    Platform.OS === "android" &&
                                        styles.androidSlider,
                                ]}
                                minimumValue={100}
                                maximumValue={2000}
                                step={10}
                                value={sliderValue}
                                onValueChange={handleRadiusChange}
                            />
                        </View>
                    </OCard>
                </View>
            </SafeAreaView>
        </View>
    );
};

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    fabContainer: {
        padding: 10,
    },
    mapContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
        position: "relative",
        minHeight: height * 0.75,
    },
    map: {
        minHeight: 400,
        borderRadius: BorderRadius.br_5xs,
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: Color.white,
    },
    sliderOverlayContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
    },
    sliderSafeArea: {
        width: "100%",
    },
    sliderWrapper: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    controlsCard: {
        padding: 16,
    },
    androidControlsCard: {
        elevation: 8,
        marginBottom: 12,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
    },
    controlsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sliderText: {
        fontSize: FontSize.size_md,
        flex: 1,
        marginRight: 16,
    },
    sliderContainer: {
        paddingVertical: Platform.OS === "android" ? 8 : 0,
    },
    slider: {
        width: "100%",
    },
    androidSlider: {
        height: 40,
    },
});
