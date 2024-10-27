import { Color, FontFamily } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OAppIntroductionSliderContent } from "@/components/OAppIntroductionSliderContent/OAppIntroductionSliderContent";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { TR, i18n } from "@/localization/translate.service";
import { saveDeviceUserHasSeenIntro } from "@/services/storage.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import Swiper from "react-native-swiper";
import { ROUTES } from "../routes";

type AppIntroductionProps = NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.AppIntroductionSlider
>;

const getSwiperComponent = (
    img: any,
    title: string,
    description: string,
    conclusion: string,
): React.FC => {
    return () => (
        <OAppIntroductionSliderContent
            img={img}
            title={i18n.t(title)}
            description={i18n.t(description)}
            conclusion={i18n.t(conclusion)}
        />
    );
};

const AppIntroduction: React.FC<AppIntroductionProps> = ({ navigation }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const swiperRef = useRef<Swiper>(null);
    const swiperComponents = [
        getSwiperComponent(
            require("@/assets/introduction-slider/first.png"),
            TR.page1Title,
            TR.page1Description,
            TR.page1Conclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/second.png"),
            TR.page2Title,
            TR.page2Description,
            TR.page2Conclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/third.png"),
            TR.page3Title,
            TR.page3Description,
            TR.page3Conclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/fourth.png"),
            TR.page4Title,
            TR.page4Description,
            TR.page4Conclusion,
        ),
    ];

    const proceedToWelcomePage = () => {
        saveDeviceUserHasSeenIntro();
        navigation.navigate(ROUTES.Welcome);
    };

    const isLastPage = currentPage === swiperComponents.length;

    return (
        <OLinearBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.pageIndicator}>{currentPage}/4</Text>
                    <TouchableOpacity
                        onPress={proceedToWelcomePage}
                        style={[
                            styles.skipLinkContainer,
                            { opacity: isLastPage ? 0 : 1 },
                        ]}
                        disabled={isLastPage}
                    >
                        <Text style={styles.skipLink}>
                            {i18n.t(TR.appIntroductionSkip)}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.swiperContainer}>
                    <Swiper
                        ref={swiperRef}
                        showsButtons={true}
                        showsPagination={false}
                        dotColor={Color.white}
                        activeDotColor={Color.schemesPrimary}
                        nextButton={
                            <MaterialIcons
                                name="chevron-right"
                                size={45}
                                color={Color.schemesPrimary}
                            />
                        }
                        prevButton={
                            <MaterialIcons
                                name="chevron-left"
                                size={45}
                                color={Color.schemesPrimary}
                            />
                        }
                        loop={false}
                        onIndexChanged={(index) => setCurrentPage(index + 1)}
                    >
                        {swiperComponents.map((SwipableComponent, index) => (
                            <SwipableComponent key={index} />
                        ))}
                    </Swiper>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={proceedToWelcomePage}
                        style={[
                            styles.registerNowContainer,
                            { opacity: isLastPage ? 1 : 0 },
                        ]}
                        disabled={!isLastPage}
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
                </View>
            </View>
        </OLinearBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20, // Add padding to match skipLinkContainer's right margin
    },
    pageIndicator: {
        fontFamily: FontFamily.montserratSemiBold,
        color: Color.white,
        fontSize: 16,
        marginLeft: 20,
    },
    swiperContainer: {
        flex: 1,
    },
    skipLinkContainer: {
        height: 24,
        marginRight: 20,
    },
    skipLink: {
        fontFamily: FontFamily.montserratSemiBold,
        color: Color.white,
        fontSize: 16,
        textDecorationLine: "none",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        marginBottom: Platform.OS === "ios" ? 40 : 20,
        paddingHorizontal: 20,
        height: 52,
        zIndex: 1, // Ensure footer stays above pagination
    },
    pagination: {
        bottom: Platform.OS === "ios" ? -10 : -20, // Position pagination below the footer
        zIndex: 0, // Keep pagination behind footer
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

export default AppIntroduction;
