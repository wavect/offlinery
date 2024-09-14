import { Color, FontSize } from "@/GlobalStyles";
import styled from "styled-components/native";

export const CheckboxContainer = styled.View`
    flex-direction: row;
    align-items: center;
`;

export const CheckboxLabel = styled.Text`
    flex: 1;
    font-size: ${FontSize.size_sm}px;
    color: ${Color.gray};
    margin-left: 10px;
`;
