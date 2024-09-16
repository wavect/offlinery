import { A } from "@expo/html-elements";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

export const StyledLinearGradient = styled(LinearGradient)`
    shadow-color: rgba(0, 0, 0, 0.25);
    shadow-offset: 0px 4px;
    shadow-radius: 4px;
    elevation: 4;
    shadow-opacity: 1;
    flex: 1;
    width: 100%;
    height: 926px;
    overflow: hidden;
    background-color: transparent;
`;

interface StyledLinkProps {
    margin?: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
}

export const StyledLink = styled(A)<StyledLinkProps>`
    color: white;
    text-decoration: underline;
    text-decoration-color: white;
    ${({ margin, marginTop, marginRight, marginBottom, marginLeft }) => `
    ${margin !== undefined ? `margin: ${margin}px;` : ""}
    ${marginTop !== undefined ? `margin-top: ${marginTop}px;` : ""}
    ${marginRight !== undefined ? `margin-right: ${marginRight}px;` : ""}
    ${marginBottom !== undefined ? `margin-bottom: ${marginBottom}px;` : ""}
    ${marginLeft !== undefined ? `margin-left: ${marginLeft}px;` : ""}
  `}
`;
