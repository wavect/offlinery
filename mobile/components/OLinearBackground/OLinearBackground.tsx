import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import oLinearBgStyles from "./OLinearBackground.styles";

interface IOLinearBackground {
    children: ReactNode;
}

export const OLinearBackground = (props: IOLinearBackground) => {
    return (
        <LinearGradient
            style={oLinearBgStyles.bgGradient}
            locations={[0.09, 0.68, 1]}
            colors={["#36797d", "#459da1", "#81c5c9"]}
            start={{ x: 0, y: 0 }} // Startpunkt für den Gradienten
            end={{ x: 1, y: 1 }} // Endpunkt für den Gradienten
        >
            {props.children}
        </LinearGradient>
    );
};
