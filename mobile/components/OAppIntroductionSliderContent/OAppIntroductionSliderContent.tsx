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
        <View style={styles.slide}>
            <View style={{ flex: 1 }}>
                <View style={styles.imageContainer}>
                    <Image
                        source={img}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ flex: 0.4 }}>
                    <Text
                        style={styles.title}
                        adjustsFontSizeToFit={true}
                        numberOfLines={2}
                    >
                        {title}
                    </Text>
                    <View>
                        <Text
                            style={styles.description}
                            adjustsFontSizeToFit={true}
                            numberOfLines={5}
                        >
                            {formatBoldText(description)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.bottomAdditionalContainer}>
                <View style={styles.divideContainer}>
                    <View style={styles.divider} />
                </View>

                <View style={styles.conclusionContainer}>
                    <Text
                        style={styles.conclusion}
                        adjustsFontSizeToFit={true}
                        numberOfLines={3}
                    >
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
        justifyContent: "space-between",
    },
    imageContainer: {
        flex: 0.6,
        marginTop: 20,
        marginBottom: 20,
    },
    image: {
        height: "100%",
    },
    title: {
        fontFamily: FontFamily.montserratSemiBold,
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 10,
        textAlign: "center",
        maxWidth: "95%",
    },
    description: {
        fontFamily: FontFamily.montserratLight,
        fontSize: 18,
        marginLeft: 20,
        marginRight: 20,
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
        marginTop: 20,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: "white",
        width: "50%",
    },
    conclusionContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});
