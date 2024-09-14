import { Color, FontFamily, FontSize } from "@/GlobalStyles";
import styled from "styled-components/native";

interface TextProps {
    bold?: boolean;
}

const createStyledText = (
    size: keyof typeof FontSize,
    defaultColor = Color.white,
) => styled.Text<TextProps>`
    font-size: ${FontSize[size]}px;
    font-family: ${(props) =>
        props.bold ? FontFamily.montserratRegular : FontFamily.montserratLight};
    font-weight: ${(props) => (props.bold ? "600" : "400")};
    color: ${defaultColor};
`;

export const StyledText = {
    XSmall: createStyledText("size_xs"),
    Small: createStyledText("size_sm"),
    Medium: createStyledText("size_md"),
    Large: createStyledText("size_xl"),
    Subtitle: styled(createStyledText("size_md", Color.gray))`
        margin-bottom: 24px;
        margin-top: 8px;
    `,
    Title: styled.Text`
        font-size: 40px;
        font-weight: 600;
        color: #000;
        margin-bottom: 8px;
    `,
};
