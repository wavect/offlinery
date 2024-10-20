import { TR, i18n } from "@/localization/translate.service";
import React from "react";
import { Image, Text, View } from "react-native";
import { introductionSliderStyles as styles } from "../introductionSlider/slider-styles";

export const IntroductionSliderWhatWeNeed: React.FC = () => {
    const img = require("@/assets/introduction-slider/third.png");

    return (
        <View style={styles.slide}>
            <View style={styles.imageContainer}>
                <Image source={img} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={styles.title}>{i18n.t(TR.page3Title)}</Text>
            <View style={styles.fixedSizeViewContainer}>
                <Text style={styles.description}>
                    {i18n.t(TR.page3Description)}
                </Text>
            </View>
            <View>
                <View style={styles.divideContainer}>
                    <View style={styles.divider} />
                </View>
                <View style={styles.oneLineTextContainer}>
                    <Text style={styles.additionalText}>
                        {i18n.t(TR.page3AddText1)}
                    </Text>
                    <Text style={styles.additionalTextBold}>
                        {i18n.t(TR.page3AddText2)}
                    </Text>
                    <Text style={styles.additionalText}>
                        {i18n.t(TR.page3AddText3)}
                    </Text>
                    <Text style={styles.additionalTextBold}>
                        {i18n.t(TR.page3AddText4)}
                    </Text>
                </View>
                <View style={styles.oneLineTextContainer}>
                    <Text style={styles.additionalText}>
                        {i18n.t(TR.page3AddText5)}
                    </Text>
                </View>
            </View>
        </View>
    );
};
