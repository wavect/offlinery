import { Color } from "@/GlobalStyles";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OSafeAreaContainer } from "@/components/OSafeAreaContainer/OSafeAreaContainer";
import OShowcase from "@/components/OShowcase/OShowcase";
import { TR, i18n } from "@/localization/translate.service";
import { SText } from "@/styles/Text.styles";
import {
    FlexContainer,
    ScrollViewContainer,
    StyledKeyboardAvoidingView,
} from "@/styles/View.styles";
import * as React from "react";
import { ReactNode, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.white} />
        <SText.Medium>{i18n.t(TR.gettingReadyToAmazeYou)}</SText.Medium>
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
        await refreshFunc!();
        setRefreshing(false);
    };

    return (
        <FlexContainer>
            <StatusBar hidden />
            <OLinearBackground>
                <StyledKeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={0}
                >
                    <ScrollViewContainer
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
                        <OSafeAreaContainer>
                            <OShowcase
                                subtitle={i18n.t(TR.stopSwipingMeetIrl)}
                            />
                            {isLoading ? <LoadingScreen /> : children}
                        </OSafeAreaContainer>
                    </ScrollViewContainer>
                </StyledKeyboardAvoidingView>
            </OLinearBackground>
        </FlexContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
