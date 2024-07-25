import * as React from "react";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";

const Splash = () => {
    return (
        <OLinearBackground>
            <OShowcase subtitle="Dating Apps are Broken." />
        </OLinearBackground>
    );
};

export default Splash;
