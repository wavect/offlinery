import { Color, FontSize } from "@/GlobalStyles";
import styled from "styled-components/native";

export const STitle = styled.Text`
    font-size: 40px;
    font-weight: 600;
    color: #000;
    margin-bottom: 8px;
`;

export const SSubtitle = styled.Text<{ bold?: boolean }>`
    font-size: ${FontSize.size_md}px;
    color: ${Color.gray};
    margin-bottom: 24px;
    font-weight: ${(props) => (props.bold ? "bold" : "normal")};
`;
