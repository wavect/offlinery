import { StyledLinearGradient } from "@/styles/Miscellaneous.styles";
import React, { ReactNode } from "react";

interface IOLinearBackground {
    children: ReactNode;
    useAngle?: boolean;
    angle?: number;
}

export const OLinearBackground = ({
    children,
    useAngle,
    angle,
}: IOLinearBackground) => {
    return (
        <StyledLinearGradient
            locations={[0.09, 0.68, 1]}
            colors={["#36797d", "#459da1", "#81c5c9"]}
            useAngle={useAngle}
            angle={angle}
        >
            {children}
        </StyledLinearGradient>
    );
};
