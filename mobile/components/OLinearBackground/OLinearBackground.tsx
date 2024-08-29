import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
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
      useAngle={true}
      angle={180}
    >
      {props.children}
    </LinearGradient>
  );
};
