import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import styled, { css } from "styled-components/native";

interface TextProps {
    bold?: boolean;
    noMargin?: boolean;
    white?: boolean;
    error?: boolean;
    center?: boolean;
    margin?: number | string;
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
            css`
                margin-bottom: ${defaultMargin}px;
                margin-top: ${defaultMargin}px;
            `}
    `;
};

const XSmall = styled(createStyledText("size_xs"))<TextProps>`
    margin-bottom: ${(props) => (props.noMargin ? 0 : "2px")};
    margin-top: ${(props) => (props.noMargin ? 0 : "2px")};
`;

const Small = styled(createStyledText("size_sm"))<TextProps>`
    margin-bottom: ${(props) => (props.noMargin ? 0 : "8px")};
    margin-top: ${(props) => (props.noMargin ? 0 : "12px")};
`;

const Medium = styled(createStyledText("size_md"))<TextProps>`
    margin-bottom: ${(props) => (props.noMargin ? 0 : "4px")};
    margin-top: ${(props) => (props.noMargin ? 0 : "4px")};
`;

const Large = styled(createStyledText("size_xl"))<TextProps>`
    margin-bottom: ${(props) => (props.noMargin ? 0 : "5px")};
    margin-top: ${(props) => (props.noMargin ? 0 : "5px")};
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
        css`
            margin-top: 14px;
            margin-bottom: 8px;
        `}
`;

const Subtitle = styled(createStyledText("size_md", 24))<TextProps>`
    color: ${(props) => {
        if (props.error) return Color.red;
        if (props.white) return Color.white;
        return Color.gray;
    }};
    ${(props) =>
        !props.noMargin &&
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
    margin-top: 16px;
    font-weight: 900;
    margin-bottom: 8px;
`;

export const CheckboxLabel = styled.Text`
    flex: 1;
    font-size: ${FontSize.size_sm}px;
    color: ${Color.gray};
    margin-left: 10px;
    margin-top: 10px;
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
