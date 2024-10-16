import { Color } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { TR, i18n } from "@/localization/translate.service";
import { IntroductionSliderMeetInRealLife } from "@/screens/onboarding/introductionSlider/IntroductionSliderMeetInRealLife";
import { IntroductionSliderSafelyZeroTolerance } from "@/screens/onboarding/introductionSlider/IntroductionSliderSafelyZeroTolerance";
import { IntroductionSliderSafety } from "@/screens/onboarding/introductionSlider/IntroductionSliderSafety";
import { IntroductionSliderWhatWeNeed } from "@/screens/onboarding/introductionSlider/IntroductionSliderWhatWeNeed";
import { introductionSliderStyles as styles } from "@/screens/onboarding/introductionSlider/slider-styles";
import { saveDeviceUserHasSeenIntro } from "@/services/storage.service";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import Swiper from "react-native-swiper";
import { ROUTES } from "../routes";

type AppIntroductionProps = NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.AppIntroductionSlider
>;

const AppIntroduction: React.FC<AppIntroductionProps> = ({ navigation }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const swiperRef = useRef<Swiper>(null);
    const swiperComponents = [
        IntroductionSliderMeetInRealLife,
        IntroductionSliderSafelyZeroTolerance,
        IntroductionSliderWhatWeNeed,
        IntroductionSliderSafety,
    ];

    const handleNext = () => {
        if (currentPage < swiperComponents.length) {
            swiperRef.current?.scrollBy(1);
        } else {
            proceedToWelcomePage();
        }
    };

    const handleBack = () => {
        if (currentPage > 1) {
            swiperRef.current?.scrollBy(-1);
        }
    };

    const proceedToWelcomePage = () => {
        saveDeviceUserHasSeenIntro();
        navigation.navigate(ROUTES.Welcome);
    };

    return (
        <OLinearBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.pageIndicator}>{currentPage}/4</Text>
                    <TouchableOpacity onPress={proceedToWelcomePage}>
                        <Text style={styles.skipLink}>
                            {i18n.t(TR.appIntroductionSkip)}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Swiper
                    ref={swiperRef}
                    showsButtons={false}
                    showsPagination={false}
                    loop={false}
                    onIndexChanged={(index) => setCurrentPage(index + 1)}
                >
                    {swiperComponents.map((SwipableComponent, index) => (
                        <SwipableComponent key={index} />
                    ))}
                </Swiper>
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={[
                            styles.pressableIconBtn,
                            currentPage === 1 && styles.invisibleButton,
                        ]}
                    >
                        <MaterialIcons
                            name="chevron-left"
                            size={32}
                            color={Color.primary}
                        />
                    </TouchableOpacity>
                    {currentPage === 4 ? (
                        <>
                            <TouchableOpacity
                                onPress={proceedToWelcomePage}
                                style={styles.registerNowContainer}
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
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={handleNext}
                                style={styles.pressableIconBtn}
                            >
                                <MaterialIcons
                                    name="chevron-right"
                                    size={32}
                                    color={Color.primary}
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </OLinearBackground>
    );
};

export default AppIntroduction;
