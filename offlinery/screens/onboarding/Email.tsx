
import * as React from "react";
import { Image, StyleSheet, Pressable, Text, View } from "react-native";
import {
    BorderRadius,
    Color,
    FontFamily,
    FontSize, Padding,
} from "../../GlobalStyles";

const Email = () => {
    return (
        <View style={[styles.email, styles.emailBg]}>
            <Text style={styles.whatsYourEmail}>What’s your email?</Text>
            <Text style={styles.dontLoseAccess}>
                Don’t lose access to your account, verify your email.
            </Text>
            <View style={styles.checkboxField}>
                <View style={[styles.checkboxAndLabel, styles.inputFlexBox]}>
                    <Image
                        style={[styles.checkboxIcon, styles.spaceLayout]}
                        resizeMode="cover"
                        source={require("../../assets/img/no-wifi.svg")}
                    />
                    <Text style={[styles.label, styles.labelTypo]}>
                        I want to receive news, updates and offers from Offlinery.
                    </Text>
                </View>
                <View style={[styles.checkboxAndLabel, styles.inputFlexBox]}>
                    <View style={styles.spaceLayout} />
                    <Text style={[styles.description, styles.labelTypo]} />
                </View>
            </View>
            <View style={[styles.inputField, styles.backPosition]}>
                <Text style={[styles.label1, styles.valueTypo]} />
                <Text style={[styles.description1, styles.errorTypo]}>Description</Text>
                <View style={[styles.input, styles.inputFlexBox]}>
                    <Text style={[styles.value, styles.valueTypo]}>Enter email</Text>
                </View>
                <Text style={[styles.error, styles.errorTypo]}>Error</Text>
            </View>
            <View style={[styles.createaccount, styles.stateLayerFlexBox]}>
                <View style={[styles.stateLayer, styles.stateLayerFlexBox]}>
                    <Text style={styles.labelText}>CONTINUE</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    emailBg: {
        backgroundColor: Color.white,
        overflow: "hidden",
    },
    backPosition: {
        left: 18,
        position: "absolute",
    },
    inputFlexBox: {
        flexDirection: "row",
        alignSelf: "stretch",
    },
    spaceLayout: {
        height: 16,
        width: 16,
        overflow: "hidden",
    },
    labelTypo: {
        marginLeft: 12,
        fontFamily: FontFamily.montserratLight,
        lineHeight: 22,
        textAlign: "left",
        fontSize: FontSize.size_md,
        flex: 1,
    },
    valueTypo: {
        fontFamily: FontFamily.montserratLight,
        color: Color.white,
        textAlign: "left",
        fontSize: FontSize.size_md,
    },
    errorTypo: {
        display: "none",
        marginTop: 8,
        fontFamily: FontFamily.montserratLight,
        lineHeight: 22,
        textAlign: "left",
        fontSize: FontSize.size_md,
    },
    stateLayerFlexBox: {
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        height: "100%",
        width: "100%",
    },
    back: {
        top: 14,
        width: 40,
        height: 38,
    },
    whatsYourEmail: {
        top: 117,
        left: 10,
        fontSize: 40,
        fontWeight: "600",
        fontFamily: FontFamily.montserratRegular,
        color: "#000",
        textAlign: "center",
        lineHeight: 28,
        position: "absolute",
    },
    dontLoseAccess: {
        top: 163,
        color: "#aaa",
        display: "flex",
        width: 370,
        height: 53,
        alignItems: "center",
        textAlign: "left",
        fontSize: FontSize.size_md,
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        lineHeight: 28,
        left: 18,
        position: "absolute",
    },
    checkboxIcon: {
        borderRadius: 4,
    },
    label: {
        color: Color.white,
    },
    checkboxAndLabel: {
        alignItems: "center",
    },
    description: {
        color: Color.gray,
    },
    checkboxField: {
        top: 319,
        left: 25,
        width: 362,
        height: 46,
        position: "absolute",
    },
    label1: {
        color: Color.white,
        lineHeight: 22,
        fontFamily: FontFamily.montserratLight,
        alignSelf: "stretch",
    },
    description1: {
        marginTop: 8,
        color: Color.gray,
        alignSelf: "stretch",
        display: "none",
    },
    value: {
        lineHeight: 16,
        color: Color.white,
        flex: 1,
    },
    input: {
        borderRadius: 8,
        borderStyle: "solid",
        borderColor: Color.gray,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 240,
        marginTop: 8,
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: Color.white,
    },
    error: {
        marginTop: 8,
        color: Color.white,
    },
    inputField: {
        top: 216,
        width: 389,
        height: 85,
    },
    labelText: {
        fontSize: 20,
        color: Color.white,
        fontFamily: FontFamily.montserratLight,
        fontWeight: "500",
        textAlign: "center",
        lineHeight: 28,
    },
    stateLayer: {
        paddingHorizontal: Padding.p_5xl,
        paddingVertical: Padding.p_3xs,
        flexDirection: "row",
        alignSelf: "stretch",
        flex: 1,
    },
    createaccount: {
        top: 818,
        left: 22,
        borderRadius: BorderRadius.br_81xl,
        backgroundColor: "#ccc",
        width: 382,
        height: 64,
        position: "absolute",
        overflow: "hidden",
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    email: {
        height: 926,
        overflow: "hidden",
        width: "100%",
        flex: 1,
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
});

export default Email;
