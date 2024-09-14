import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import styled, { css } from "styled-components/native";

interface TextProps {
    bold?: boolean;
    noMargin?: boolean;
    white?: boolean;
    center?: boolean;
    margin?: number | string;
}

const baseTextStyles = css<TextProps>`
    font-family: ${(props) =>
        props.bold ? FontFamily.montserratRegular : FontFamily.montserratLight};
    font-weight: ${(props) => (props.bold ? "900" : "200")};
    color: ${(props) => (props.white ? Color.white : Color.black)};
    ${(props) =>
        props.center &&
        css`
            text-align: center;
        `}
    ${(props) =>
        !props.noMargin &&
        css`
            margin-bottom: ${props.margin || 0}px;
        `}
`;

const createStyledText = (
    size: keyof typeof FontSize,
    defaultMargin: number = 4,
) => {
    return styled.Text<TextProps>`
        ${baseTextStyles}
        font-size: ${FontSize[size]}px;
        ${(props) =>
            !props.noMargin &&
            !props.margin &&
            css`
                margin-bottom: ${defaultMargin}px;
                margin-top: ${defaultMargin}px;
            `}
    `;
};

const XSmall = createStyledText("size_xs", 2);
const Small = createStyledText("size_sm", 3);
const Medium = createStyledText("size_md", 4);
const Large = createStyledText("size_xl", 5);

const Subtitle = styled(createStyledText("size_md", 24))<TextProps>`
    color: ${(props) => (props.white ? Color.white : Color.gray)};
    ${(props) =>
        !props.noMargin &&
        !props.margin &&
        css`
            margin-top: 8px;
        `}
`;

const Title = styled(createStyledText("size_xl", 8))<TextProps>`
    font-size: 40px;
    font-weight: 600;
`;

export const StyledText = {
    XSmall,
    Small,
    Medium,
    Large,
    Subtitle,
    Title,
};
