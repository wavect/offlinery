import { Color } from "@/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import styled, { css } from "styled-components/native";

interface StyledIconProps {
    name: string;
    size?: number;
    color?: string;
    noMargin?: boolean;
}

const iconStyles = css<StyledIconProps>`
    ${(props) =>
        !props.noMargin &&
        css`
            margin-right: 14px;
        `}
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
