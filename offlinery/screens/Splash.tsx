import * as React from "react";
import {OShowcase} from "../components/OShowcase/OShowcase";
import {OLinearBackground} from "../components/OLinearBackground/OLinearBackground";
import {StyleSheet, View} from "react-native";

const Splash = () => {
    return (
        <OLinearBackground>
            <View style={styles.layoutContainer}>
                <OShowcase subtitle="Dating Apps are Broken."/>
            </View>
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    layoutContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        marginTop: 334,
    },
})

export default Splash;
