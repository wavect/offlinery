import * as React from "react";
import { StyleSheet, View } from "react-native";
import { OLinearBackground } from "../components/OLinearBackground/OLinearBackground";
import { OShowcase } from "../components/OShowcase/OShowcase";
import { i18n, TR } from "../localization/translate.service";

const Splash = () => {
    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>
                <OShowcase subtitle={i18n.t(TR.datingAppsAreBroken)} />
            </View>
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    layoutContainer: {
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        marginTop: 334,
    },
});

export default Splash;
