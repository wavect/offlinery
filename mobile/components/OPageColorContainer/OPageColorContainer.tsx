import { Color, FontFamily } from "@/GlobalStyles";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OSafeAreaContainer } from "@/components/OSafeAreaContainer/OSafeAreaContainer";
import OShowcase from "@/components/OShowcase/OShowcase";
import { TR, i18n } from "@/localization/translate.service";
import * as React from "react";
import { ReactNode, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.white} />
        <Text style={[styles.loadingText, { color: Color.white }]}>
            {i18n.t(TR.gettingReadyToAmazeYou)}
        </Text>
    </View>
);

interface IOPageColorContainerProps {
    isLoading?: boolean;
    children: ReactNode;
    refreshFunc?: () => Promise<void>;
}

export const OPageColorContainer = (props: IOPageColorContainerProps) => {
    const { isLoading, children, refreshFunc } = props;
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshFunc!();
        } catch (err) {
            throw err;
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <View style={styles.container}>
            <OLinearBackground>
                <StatusBar
                    barStyle="light-content"
                    translucent
                    backgroundColor="transparent"
                />
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
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
                        <OSafeAreaContainer containerStyle={styles.content}>
                            <OShowcase
                                subtitle={i18n.t(TR.likeOldDays)}
                                containerStyle={styles.showCaseStyle}
                            />
                            {isLoading ? <LoadingScreen /> : children}
                        </OSafeAreaContainer>
                    </ScrollView>
                </KeyboardAvoidingView>
            </OLinearBackground>
        </View>
    );
};

const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: width * 0.05,
    },
    showCaseStyle: {
        marginTop: height * 0.07,
        marginBottom: 20,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        textAlign: "center",
        fontFamily: FontFamily.montserratLight,
    },
});
