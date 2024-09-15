import { Color } from "@/GlobalStyles";
import { StyledMaterialIcon } from "@/styles/Icon.styles";
import { SText } from "@/styles/Text.styles";
import {
    ButtonContainer,
    Content,
    IconContainer,
    PageContainer,
} from "@/styles/View.styles";
import { MaterialIcons as MaterialIconsType } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from "react-native";

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
        <PageContainer>
            {props.fullpageIcon && (
                <IconContainer>
                    <StyledMaterialIcon
                        name={props.fullpageIcon}
                        size={Math.min(width, height) * 0.8}
                        color={Color.brightestGray}
                    />
                </IconContainer>
            )}
            <MainViewContainer
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <Content>
                    {props.title && <SText.Title>{props.title}</SText.Title>}
                    {props.subtitle && (
                        <SText.Subtitle>{props.subtitle}</SText.Subtitle>
                    )}
                    {props.children}
                </Content>
            </MainViewContainer>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
            >
                <ButtonContainer>
                    {props.bottomContainerChildren}
                </ButtonContainer>
            </KeyboardAvoidingView>
        </PageContainer>
    );
};
