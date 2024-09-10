import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { OShowcase } from "@/components/OShowcase/OShowcase";
import { TR, i18n } from "@/localization/translate.service";
import * as React from "react";
import { StyleSheet, View } from "react-native";

const Splash = () => {
    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>
                <OShowcase
                    subtitle={i18n.t(TR.datingAppsAreBroken)}
                    onlyUseSystemFont={true}
                />
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
