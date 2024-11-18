import { Color, FontFamily } from "@/GlobalStyles";
import { TR, formatBoldText, i18n } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface IAppIntroductionSliderContentProps {
    img: any;
    title: string;
    description: string;
    conclusion: string;
    lastPageAction?: () => void;
}

export const OAppIntroductionSliderContent = (
    props: IAppIntroductionSliderContentProps,
) => {
    const { img, title, description, conclusion, lastPageAction } = props;
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
                {lastPageAction ? (
                    <TouchableOpacity
                        onPress={lastPageAction}
                        style={[styles.registerNowContainer]}
                    >
                        <Text style={styles.registerNowText}>
                            {i18n.t(TR.letsMeetIRL)}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={32}
                            color={Color.primary}
                        />
                    </TouchableOpacity>
                ) : null}
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
    registerNowContainer: {
        display: "flex",
        flexDirection: "row",
        padding: 10,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowRadius: 3.84,
        elevation: 5,
    },
    registerNowText: {
        fontFamily: FontFamily.montserratSemiBold,
        color: Color.primary,
        fontSize: 16,
    },
});
