import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import styled, { css } from "styled-components/native";

interface TextProps {
    bold?: boolean;
    noMargin?: boolean;
    white?: boolean;
    error?: boolean;
    center?: boolean;
    margin?: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
}

const baseTextStyles = css<TextProps>`
    font-family: ${(props) =>
        props.bold ? FontFamily.montserratRegular : FontFamily.montserratLight};
    font-weight: ${(props) => (props.bold ? "900" : "200")};
    color: ${(props) => {
        if (props.white) return Color.white;
        return Color.black;
    }};
    ${(props) =>
        props.center &&
        css`
            text-align: center;
        `}
    ${({ margin, marginTop, marginRight, marginBottom, marginLeft }) => css`
        ${margin !== undefined ? `margin: ${margin}px;` : ""}
        ${marginTop !== undefined ? `margin-top: ${marginTop}px;` : ""}
    ${marginRight !== undefined ? `margin-right: ${marginRight}px;` : ""}
    ${marginBottom !== undefined ? `margin-bottom: ${marginBottom}px;` : ""}
    ${marginLeft !== undefined ? `margin-left: ${marginLeft}px;` : ""}
    `}
`;

const createStyledText = (
    size: keyof typeof FontSize,
    defaultMargin: number = 12,
) => {
    return styled.Text<TextProps>`
        ${baseTextStyles};
        font-size: ${FontSize[size]}px;
        ${(props) =>
            !props.noMargin &&
            !props.margin &&
            !props.marginTop &&
            !props.marginBottom &&
            css`
                margin-bottom: ${defaultMargin}px;
                margin-top: ${defaultMargin}px;
            `}
    `;
};

const XSmall = styled(createStyledText("size_xs"))<TextProps>`
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginBottom &&
        css`
            margin-bottom: ${props.noMargin ? 0 : "2px"};
            margin-top: ${props.noMargin ? 0 : "2px"};
        `}
`;

const Small = styled(createStyledText("size_sm"))<TextProps>`
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginBottom &&
        css`
            margin-bottom: ${props.noMargin ? 0 : "12px"};
            margin-top: ${props.noMargin ? 0 : "12px"};
        `}
`;

const Medium = styled(createStyledText("size_md"))<TextProps>`
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginBottom &&
        css`
            margin-bottom: ${props.noMargin ? 0 : "4px"};
            margin-top: ${props.noMargin ? 0 : "4px"};
        `}
`;

const Large = styled(createStyledText("size_xl"))<TextProps>`
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginBottom &&
        css`
            margin-bottom: ${props.noMargin ? 0 : "5px"};
            margin-top: ${props.noMargin ? 0 : "5px"};
        `}
`;

const InputLabel = styled(createStyledText("size_md", 24))<TextProps>`
    color: ${(props) => {
        if (props.error) return Color.red;
        if (props.white) return Color.white;
        return Color.black;
    }};
    text-align: left;
    font-weight: bold;
    font-size: 16px;
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginBottom &&
        css`
            margin-top: 14px;
            margin-bottom: 8px;
        `}
`;

const Subtitle = styled(createStyledText("size_xl", 24))<TextProps>`
    color: ${(props) => {
        if (props.error) return Color.red;
        if (props.white) return Color.white;
        return Color.gray;
    }};
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        css`
            margin-top: 8px;
        `}
`;

const Title = styled(createStyledText("size_xl"))<TextProps>`
    font-size: 40px;
    font-weight: 600;
`;

const Error = styled(createStyledText("size_xl"))<TextProps>`
    font-size: ${FontSize.size_sm}px;
    color: red;
    font-weight: 900;
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginBottom &&
        css`
            margin-top: 16px;
            margin-bottom: 8px;
        `}
`;

export const CheckboxLabel = styled.Text<TextProps>`
    flex: 1;
    font-size: ${FontSize.size_sm}px;
    color: ${Color.gray};
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        !props.marginTop &&
        !props.marginLeft &&
        css`
            margin-left: 10px;
            margin-top: 10px;
        `}
    ${baseTextStyles}
`;

export const SText = {
    CheckboxLabel,
    InputLabel,
    XSmall,
    Small,
    Medium,
    Large,
    Subtitle,
    Title,
    Error,
};
