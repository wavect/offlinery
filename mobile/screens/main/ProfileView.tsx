import { Color, Subtitle } from "@/GlobalStyles";
import { UserPublicDTO } from "@/api/gen/src";
import { OBadgesOfUser } from "@/components/OBadge/OBadgesOfUser";
import { OImageWithLoader } from "@/components/OImageWithLoader/OImageWithLoader";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OPageHeader } from "@/components/OPageHeader/OPageHeader";
import { OPageHeaderEncounters } from "@/components/OPageHeader/OPageHeaderEncounters/OPageHeaderEncounters";
import { TR, i18n } from "@/localization/translate.service";
import { EncounterStackParamList } from "@/screens/main/EncounterStack.navigator";
import { ROUTES } from "@/screens/routes";
import { getValidImgURI } from "@/utils/media.utils";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
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
    navigation,
}: NativeStackScreenProps<
    EncounterStackParamList,
    typeof ROUTES.Main.ProfileView
>) => {
    const progressValue = useSharedValue<number>(0);
    const width = Dimensions.get("window").width;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselRef = useRef<ICarouselInstance>(null);

    const renderPreviewImage = ({
        item,
        index,
    }: {
        item: string;
        index: number;
    }) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    setCurrentImageIndex(index);
                    carouselRef.current?.scrollTo({ index: index });
                }}
                style={styles.previewImageContainer}
            >
                <OImageWithLoader
                    source={{ uri: item }}
                    style={styles.previewImage}
                />
            </TouchableOpacity>
        );
    };
    const user: UserPublicDTO | undefined = route?.params?.user;
    if (!user) return <Text>{i18n.t(TR.errNoUserProvided)}</Text>;
    const bottomContainerChildren: React.ReactNode =
        route?.params?.bottomContainerChildren;

    useEffect(() => {
        // @dev overrides tab nav title
        const parent = navigation.getParent();
        parent?.setOptions({
            headerLeft: () => (
                <OPageHeader title={`${user.firstName}, ${user.age}`} />
            ),
        });
        return () => {
            parent?.setOptions({
                headerLeft: () => <OPageHeaderEncounters />,
            });
        };
    }); // empty dep array to run it only once

    return (
        <OPageContainer
            containerStyle={{ paddingTop: 4 }}
            bottomContainerChildren={bottomContainerChildren}
        >
            <OBadgesOfUser intentions={user.intentions} />
            <Text style={[Subtitle, { marginTop: 6 }]}>{user.bio}</Text>

            <View style={styles.carouselContainer}>
                {user.imageURIs?.length > 1 ? (
                    <Carousel
                        ref={carouselRef}
                        loop
                        width={width - 32}
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
                                onPress={() => {
                                    setCurrentImageIndex(index);
                                }}
                            >
                                <OImageWithLoader
                                    source={{ uri: item }}
                                    style={styles.carouselImage}
                                />
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <TouchableOpacity
                        style={styles.touchableContainer}
                        onPress={() => {
                            setCurrentImageIndex(0);
                        }}
                    >
                        <OImageWithLoader
                            source={{ uri: getValidImgURI(user.imageURIs[0]) }}
                            style={styles.carouselImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
                {user.imageURIs.length > 1 && (
                    <View style={styles.paginationContainer}>
                        {user.imageURIs.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    {
                                        backgroundColor:
                                            currentImageIndex === index
                                                ? Color.primaryBright
                                                : Color.lightGray,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                )}
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
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    touchableContainer: {
        width: "100%",
        height: (Dimensions.get("window").width - 32) * 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    carouselContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    carouselImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        resizeMode: "cover",
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
