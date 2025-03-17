import { Color, FontFamily } from "@/GlobalStyles";
import { TR, formatBoldText, i18n } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
const { width, height } = Dimensions.get("window");

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
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={img}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text
                        style={styles.title}
                        numberOfLines={2}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.7}
                    >
                        {title}
                    </Text>
                    <Text
                        style={styles.description}
                        numberOfLines={5}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.4}
                    >
                        {formatBoldText(description)}
                    </Text>
                </View>
            </View>

            <View style={styles.bottomAdditionalContainer}>
                {lastPageAction && (
                    <TouchableOpacity
                        onPress={lastPageAction}
                        style={styles.registerNowContainer}
                    >
                        <Text style={styles.registerNowText}>
                            {i18n.t(TR.letsMeetIRL)}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={Color.primary}
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.divideContainer}>
                    <View style={styles.divider} />
                </View>

                <Text style={styles.conclusion} numberOfLines={3}>
                    {formatBoldText(conclusion)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        paddingHorizontal: width * 0.05,
        justifyContent: "space-between",
    },
    content: {
        flex: 1,
        justifyContent: "space-around",
    },
    imageContainer: {
        flex: 0.5,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: height * 0.03,
    },
    image: {
        height: "100%",
    },
    textContainer: {
        flex: 0.4,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontFamily: FontFamily.montserratSemiBold,
        fontSize: width * 0.07,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: height * 0.02,
    },
    description: {
        fontFamily: FontFamily.montserratLight,
        fontSize: width * 0.045,
        color: "white",
        textAlign: "center",
        marginBottom: height * 0.02,
    },
    bottomAdditionalContainer: {
        alignItems: "center",
        marginVertical: height < 600 ? 10 : 20,
    },
    divideContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: height < 600 ? 10 : 20,
        width: "100%",
    },
    divider: {
        height: 1,
        backgroundColor: "white",
        width: "50%",
    },
    registerNowContainer: {
        flexDirection: "row",
        padding: height * 0.017,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        marginBottom: height * 0.02,
        width: "100%",
        marginVertical: height < 600 ? 10 : 20,
    },
    registerNowText: {
        fontFamily: FontFamily.montserratSemiBold,
        color: Color.primary,
        fontSize: width * 0.045,
    },
    conclusion: {
        fontFamily: FontFamily.montserratLight,
        fontSize: width * 0.045,
        color: "white",
        textAlign: "center",
        marginTop: height * 0.04,
    },
});
