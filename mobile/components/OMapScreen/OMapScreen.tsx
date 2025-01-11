import { Color, FontSize } from "@/GlobalStyles";
import OCard from "@/components/OCard/OCard";
import { OMap } from "@/components/OMap/OMap";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IOMapScreenProps {
    subtitle?: string;
    subtitle2?: string;
    saveChangesToBackend: boolean;
    showHeatmap: boolean;
    showBlacklistedRegions: boolean;
    bottomChildren?: React.ReactNode;
}

const OMapScreen = ({
    subtitle,
    subtitle2,
    showHeatmap,
    showBlacklistedRegions,
    saveChangesToBackend,
    bottomChildren,
}: IOMapScreenProps) => {
    return (
        <View
            style={[
                styles.container,
                Platform.OS === "android" ? { marginTop: -15 } : undefined,
            ]}
        >
            <SafeAreaView edges={["right", "left"]} style={styles.overlay}>
                <OMap
                    saveChangesToBackend={saveChangesToBackend}
                    showHeatmap={showHeatmap}
                    showBlacklistedRegions={showBlacklistedRegions}
                />
            </SafeAreaView>

            {subtitle && (
                <SafeAreaView
                    edges={["top", "right", "left"]}
                    style={styles.overlay}
                >
                    <View
                        style={[
                            styles.topContent,
                            Platform.OS === "android"
                                ? { marginTop: 6 }
                                : undefined,
                        ]}
                    >
                        <OCard dismissable={true}>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        </OCard>
                        {subtitle2 && (
                            <OCard dismissable={true} style={{ marginTop: 6 }}>
                                <Text style={styles.subtitle}>{subtitle2}</Text>
                            </OCard>
                        )}
                    </View>
                </SafeAreaView>
            )}

            {bottomChildren && (
                <SafeAreaView edges={["bottom"]} style={styles.bottomContainer}>
                    <OCard style={styles.bottomCard}>{bottomChildren}</OCard>
                </SafeAreaView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    topContent: {
        marginHorizontal: 16,
    },
    subtitle: {
        fontSize: FontSize.size_sm,
        color: "#666666",
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    bottomCard: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
    },
});

export default OMapScreen;
