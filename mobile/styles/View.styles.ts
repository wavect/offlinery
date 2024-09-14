import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import { Platform } from "react-native";
import styled from "styled-components/native";

export const TermsContainerOuter = styled.View`
    margin-bottom: 25px;
    min-height: 81px;
    letter-spacing: 0;
    color: ${Color.white};
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 24px;
    width: 88%;
    height: 45px;
`;

export const TermsText = styled.Text`
    font-family: ${FontFamily.montserratLight};
    font-weight: 500;
    font-size: ${FontSize.size_sm}px;
    text-shadow-color: rgba(0, 0, 0, 0.25);
    text-shadow-offset: 0px 4px;
    color: ${Color.white};
    line-height: 20px;
    text-shadow-radius: 4px;
    text-align: center;
`;

export const TermsLink = styled.Text`
    text-decoration-line: underline;
`;

export const Container = styled.View`
    width: 100%;
    align-items: center;
`;

export const PageContainer = styled.View`
    flex: 1;
    background-color: #fff;
    padding: 18px;
    width: 100%;
`;

export const Content = styled.View`
    flex: 1;
`;

export const ButtonContainer = styled.View`
    align-items: center;
    width: 100%;
    margin-top: auto;
    ${Platform.OS === "ios" &&
    `
    margin-bottom: 10px;
  `}
`;

export const IconContainer = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
    z-index: -1;
`;
