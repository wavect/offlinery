import { StyledMaterialIcon } from "@/styles/Icon.styles";
import { SText } from "@/styles/Text.styles";
import {
    CenteredContainer,
    ShowCaseHeadlineContainer,
} from "@/styles/View.styles";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

interface IOShowcaseProps {
    subtitle: string;
    onlyUseSystemFont?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

export const OShowcase = (props: IOShowcaseProps) => {
    const { subtitle } = props;

    return (
        <CenteredContainer>
            <ShowCaseHeadlineContainer>
                <StyledMaterialIcon name="wifi-off" />
                <SText.Title white>offlinery</SText.Title>
            </ShowCaseHeadlineContainer>
            <SText.Subtitle white bold>
                {subtitle}
            </SText.Subtitle>
        </CenteredContainer>
    );
};

export default OShowcase;
