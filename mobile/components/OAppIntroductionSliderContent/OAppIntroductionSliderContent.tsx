import { FontFamily } from "@/GlobalStyles";
import { formatBoldText } from "@/localization/translate.service";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface IAppIntroductionSliderContentProps {
    img: any;
    title: string;
    description: string;
    conclusion: string;
}

export const OAppIntroductionSliderContent = (
    props: IAppIntroductionSliderContentProps,
) => {
    const { img, title, description, conclusion } = props;
    return (
        <View style={[styles.slide, { justifyContent: "space-between" }]}>
            <View style={{ flex: 1 }}>
                <View style={[styles.imageContainer, { flex: 0.6 }]}>
                    <Image
                        source={img}
                        style={[styles.image, { height: "100%" }]}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ flex: 0.4 }}>
                    <Text style={[styles.title, { marginTop: 0 }]}>
                        {title}
                    </Text>
                    <View>
                        <Text style={styles.description}>
                            {formatBoldText(description)}
                        </Text>
                    </View>
                </View>
            </View>

            <View
                style={[
                    styles.bottomAdditionalContainer,
                    {
                        marginTop: "auto",
                        paddingBottom: 60,
                    },
                ]}
            >
                <View style={styles.divideContainer}>
                    <View style={[styles.divider, { marginVertical: 16 }]} />
                </View>

                <View
                    style={[styles.oneLineTextContainer, { marginBottom: 8 }]}
                >
                    <Text style={styles.conclusion}>
                        {formatBoldText(conclusion)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        paddingRight: 24,
        paddingLeft: 24,
        paddingBottom: 0,
        textAlign: "left",
    },
    imageContainer: {
        display: "flex",
        marginTop: 20,
        marginBottom: 20,
    },
    image: {
        width: "100%",
        height: "60%",
    },
    title: {
        fontFamily: FontFamily.montserratSemiBold,
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
        maxWidth: "95%",
    },
    description: {
        fontFamily: FontFamily.montserratLight,
        fontSize: 18,
        color: "white",
        textAlign: "center",
    },
    conclusion: {
        fontFamily: FontFamily.montserratLight,
        fontSize: 18,
        color: "white",
        textAlign: "center",
    },
    bottomAdditionalContainer: {
        width: "100%",
    },
    divideContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "white",
        width: "50%",
        marginVertical: 20,
    },
    oneLineTextContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});
