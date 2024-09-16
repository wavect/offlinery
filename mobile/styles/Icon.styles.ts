import { Color } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import styled, { css } from "styled-components/native";

interface StyledIconProps {
    name: string;
    size?: number;
    color?: string;
    noMargin?: boolean;
    margin?: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
}

const iconStyles = css<StyledIconProps>`
    ${({
        noMargin,
        margin,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
    }) => {
        if (noMargin) return "";
        if (margin || marginTop || marginRight || marginBottom || marginLeft) {
            return css`
                ${margin !== undefined ? `margin: ${margin}px;` : ""}
                ${marginTop !== undefined ? `margin-top: ${marginTop}px;` : ""}
        ${marginRight !== undefined ? `margin-right: ${marginRight}px;` : ""}
        ${marginBottom !== undefined ? `margin-bottom: ${marginBottom}px;` : ""}
        ${marginLeft !== undefined ? `margin-left: ${marginLeft}px;` : ""}
            `;
        }
    }}
`;

export const StyledMaterialIcon = styled(MaterialIcons).attrs<StyledIconProps>(
    (props) => ({
        name: props.name,
        size: props.size || 45,
        color: props.color || Color.white,
    }),
)`
    display: flex;
    ${iconStyles}
`;
