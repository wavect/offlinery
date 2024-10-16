import { TR, i18n } from "@/localization/translate.service";
import React from "react";
import { Image, Text, View } from "react-native";
import { introductionSliderStyles as styles } from "../introductionSlider/slider-styles";

export const IntroductionSliderSafety: React.FC = () => {
    const img = require("@/assets/introduction-slider/fourth.png");

    return (
        <View style={styles.slide}>
            <View style={styles.imageContainer}>
                <Image source={img} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={styles.title}>{i18n.t(TR.page4Title)}</Text>
            <Text style={styles.description}>
                {i18n.t(TR.page4Description)}
            </Text>
            <View style={styles.divideContainer}>
                <View style={styles.divider} />
            </View>
            <View style={styles.oneLineTextContainer}>
                <Text style={styles.additionalText}>
                    {i18n.t(TR.page4AddText1)}
                </Text>
            </View>
            <View style={styles.oneLineTextContainer}>
                <Text style={styles.additionalTextBold}>
                    {i18n.t(TR.page4AddText2)}
                </Text>
            </View>
        </View>
    );
};
