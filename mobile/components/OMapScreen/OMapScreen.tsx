import { Color, FontSize } from "@/GlobalStyles";
import OCard from "@/components/OCard/OCard";
import { OMap } from "@/components/OMapScreen/OMap/OMap";
import React, { memo } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IOMapScreenProps {
    subtitle?: string;
    subtitle2?: string;
    saveChangesToBackend: boolean;
    showHeatmap: boolean;
    showEvents: boolean;
    /// @dev This property lets the OMap component know to push bottom elements such as the slider up a bit since we show a button below it (e.g. continue in onboarding)
    showingBottomButton: boolean;
    showBlacklistedRegions: boolean;
    showMapStatus: boolean;
    showEncounters: boolean;
    bottomChildren?: React.ReactNode;
}

const BottomChildrenMemo = memo(({ children }: any) => (
    <SafeAreaView style={styles.bottomContainer} edges={["bottom"]}>
        <View style={styles.bottomCard}>{children}</View>
    </SafeAreaView>
));

const TopContentMemo = memo(
    ({ subtitle, subtitle2 }: { subtitle: string; subtitle2?: string }) => (
        <SafeAreaView
            style={[styles.topContentContainer]}
            edges={["top", "right", "left"]}
        >
            <View style={styles.topContent}>
                <OCard dismissable={true}>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </OCard>
                {subtitle2 && (
                    <OCard dismissable={true} style={styles.subtitleCard}>
                        <Text style={styles.subtitle}>{subtitle2}</Text>
                    </OCard>
                )}
            </View>
        </SafeAreaView>
    ),
);

const OMapScreen = ({
    subtitle,
    subtitle2,
    showHeatmap,
    showEvents,
    showEncounters,
    showMapStatus,
    showingBottomButton,
    showBlacklistedRegions,
    saveChangesToBackend,
    bottomChildren,
}: IOMapScreenProps) => {
    return (
        <View style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="dark-content"
            />

            <SafeAreaView style={styles.overlay} edges={["right", "left"]}>
                <OMap
                    saveChangesToBackend={saveChangesToBackend}
                    showHeatmap={showHeatmap}
                    showEvents={showEvents}
                    showEncounters={showEncounters}
                    showMapStatus={showMapStatus}
                    showingBottomButton={showingBottomButton}
                    showBlacklistedRegions={showBlacklistedRegions}
                />
            </SafeAreaView>

            {subtitle && (
                <TopContentMemo subtitle={subtitle} subtitle2={subtitle2} />
            )}

            {bottomChildren && (
                <BottomChildrenMemo>{bottomChildren}</BottomChildrenMemo>
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
        flex: 1,
    },
    topContentContainer: {
        position: "absolute",
        top: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    topContent: {
        marginHorizontal: 16,
        marginTop: 10,
    },
    subtitle: {
        fontSize: FontSize.size_sm,
        color: "#666666",
    },
    subtitleCard: {
        marginTop: 6,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    bottomCard: {
        width: "100%",
        alignItems: "center",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginBottom: 0,
    },
});

export default OMapScreen;
