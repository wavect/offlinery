import { Color, FontFamily } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { OAppIntroductionSliderContent } from "@/components/OAppIntroductionSliderContent/OAppIntroductionSliderContent";
import { OLinearBackground } from "@/components/OLinearBackground/OLinearBackground";
import { TR, i18n } from "@/localization/translate.service";
import { saveDeviceUserHasSeenIntro } from "@/services/storage.service";
import React, { useRef, useState } from "react";
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { SwiperFlatList } from "react-native-swiper-flatlist";
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
    lastPageAction?: () => void,
): React.FC => {
    return () => (
        <OAppIntroductionSliderContent
            img={img}
            title={i18n.t(title)}
            description={i18n.t(description)}
            conclusion={i18n.t(conclusion)}
            lastPageAction={lastPageAction}
        />
    );
};

const AppIntroduction: React.FC<AppIntroductionProps> = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const [currentPage, setCurrentPage] = useState(1);
    const swiperRef = useRef<SwiperFlatList>(null);

    const proceedToWelcomePage = async () => {
        await saveDeviceUserHasSeenIntro();
        navigation.navigate(ROUTES.Welcome);
    };

    const swiperComponents = [
        getSwiperComponent(
            require("@/assets/introduction-slider/appForAll.png"),
            TR.pageAppForAllTitle,
            TR.pageAppForAllDescription,
            TR.pageAppForAllConclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/offline.png"),
            TR.pageOfflineTitle,
            TR.pageOfflineDescription,
            TR.pageOfflineConclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/safety.png"),
            TR.pageSafetyTitle,
            TR.pageSafetyDescription,
            TR.pageSafetyConclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/location.png"),
            TR.pageLocationTitle,
            TR.pageLocationDescription,
            TR.pageLocationConclusion,
        ),
        getSwiperComponent(
            require("@/assets/introduction-slider/data.png"),
            TR.pageDataTitle,
            TR.pageDataDescription,
            TR.pageDataConclusion,
            proceedToWelcomePage,
        ),
    ];

    const isLastPage = currentPage === swiperComponents.length;

    return (
        <OLinearBackground>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.pageIndicator}>
                        {currentPage}/{swiperComponents.length}
                    </Text>
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
                <View style={[styles.contentContainer]}>
                    <View style={[styles.swiperContainer, { width }]}>
                        <SwiperFlatList
                            ref={swiperRef}
                            showPagination
                            paginationStyle={styles.pagination}
                            paginationStyleItem={styles.paginationDot}
                            paginationStyleItemActive={
                                styles.paginationDotActive
                            }
                            onChangeIndex={({ index }) =>
                                setCurrentPage(index + 1)
                            }
                            data={swiperComponents}
                            renderItem={({
                                item: SwipableComponent,
                                index,
                            }) => (
                                <View style={{ width }}>
                                    <SwipableComponent key={index} />
                                </View>
                            )}
                        />
                    </View>
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
        paddingHorizontal: 20,
    },
    contentContainer: {
        flex: 1,
        marginBottom: 80, // Space for pagination and footer
    },
    pageIndicator: {
        fontFamily: FontFamily.montserratSemiBold,
        color: Color.white,
        fontSize: 16,
        marginLeft: 20,
    },
    swiperContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
    pagination: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? -60 : -40,
        alignSelf: "center",
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    paginationDotActive: {
        backgroundColor: Color.white,
        width: 16,
    },
});

export default AppIntroduction;
