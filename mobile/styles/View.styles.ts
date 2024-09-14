import { Color, FontFamily, FontSize } from "@/GlobalStyles";
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
