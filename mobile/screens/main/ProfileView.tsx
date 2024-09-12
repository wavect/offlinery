import { Color } from "@/GlobalStyles";
import { UserPublicDTO } from "@/api/gen/src";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { TR, i18n } from "@/localization/translate.service";
import { EncounterStackParamList } from "@/screens/main/EncounterStack.navigator";
import { ROUTES } from "@/screens/routes";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const ProfileView = ({
    route,
}: NativeStackScreenProps<
    EncounterStackParamList,
    typeof ROUTES.Main.ProfileView
>) => {
    const progressValue = useSharedValue<number>(0);
    const width = Dimensions.get("window").width;
    const [fullScreenVisible, setFullScreenVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselRef = useRef<ICarouselInstance>(null);

    const renderPreviewImage = ({
        item,
        index,
    }: {
        item: string;
        index: number;
    }) => (
        <TouchableOpacity
            onPress={() => {
                setCurrentImageIndex(index);
                carouselRef.current?.scrollTo({ index: index });
                setFullScreenVisible(true);
            }}
            style={styles.previewImageContainer}
        >
            <Image source={{ uri: item }} style={styles.previewImage} />
        </TouchableOpacity>
    );
    const user: UserPublicDTO | undefined = route?.params?.user;
    if (!user) return <Text>{i18n.t(TR.errNoUserProvided)}</Text>;
    const bottomContainerChildren: React.ReactNode =
        route?.params?.bottomContainerChildren;

    return (
        <OPageContainer
            title={`${user.firstName}, ${user.age}`}
            subtitle={user.bio}
            bottomContainerChildren={bottomContainerChildren}
        >
            <View style={styles.carouselContainer}>
                <Carousel
                    ref={carouselRef}
                    loop
                    width={width - 32} // Adjust width to account for padding
                    height={(width - 32) * 0.8}
                    autoPlay={false}
                    data={user.imageURIs}
                    scrollAnimationDuration={1000}
                    onProgressChange={(_, absoluteProgress) => {
                        progressValue.value = absoluteProgress;
                        setCurrentImageIndex(
                            Math.floor(absoluteProgress) %
                                user.imageURIs.length,
                        );
                    }}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => setFullScreenVisible(true)}
                        >
                            <Image
                                source={{ uri: item }}
                                style={styles.carouselImage}
                            />
                        </TouchableOpacity>
                    )}
                />
                <View style={styles.paginationContainer}>
                    {user.imageURIs.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.paginationDot,
                                {
                                    backgroundColor:
                                        currentImageIndex === index
                                            ? Color.primaryLight
                                            : Color.lightGray,
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>

            {user.imageURIs.length > 2 && (
                <FlatList
                    data={user.imageURIs}
                    renderItem={renderPreviewImage}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={false}
                    numColumns={4}
                    style={styles.previewList}
                />
            )}

            <Modal
                animationType="fade"
                transparent={false}
                visible={fullScreenVisible}
                onRequestClose={() => setFullScreenVisible(false)}
            >
                <View style={styles.fullScreenContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setFullScreenVisible(false)}
                    >
                        <View style={styles.closeButtonInner}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </View>
                    </TouchableOpacity>
                    <Image
                        source={{ uri: user.imageURIs[currentImageIndex] }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    carouselImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    previewList: {
        marginTop: 10,
    },
    previewImageContainer: {
        flex: 1,
        margin: 2,
        aspectRatio: 1,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: 5,
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    fullScreenImage: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 1,
    },
    closeButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        color: "white",
        fontSize: 35,
        fontWeight: "bold",
    },
});

export default ProfileView;
