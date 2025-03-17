import { Color, Subtitle } from "@/GlobalStyles";
import { UserPublicDTO } from "@/api/gen/src";
import { OImageWithLoader } from "@/components/OImageWithLoader/OImageWithLoader";
import { OBadgesOfUser } from "@/components/OIntentionBadge/OBadgesOfUser";
import { OLoadingSpinner } from "@/components/OLoadingCircle/OLoadingCircle";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import { OPageHeader } from "@/components/OPageHeader/OPageHeader";
import { OPageHeaderEncounters } from "@/components/OPageHeader/OPageHeaderEncounters/OPageHeaderEncounters";
import { TR, i18n } from "@/localization/translate.service";
import { EncounterStackParamList } from "@/screens/main/EncounterStack.navigator";
import { ROUTES } from "@/screens/routes";
import { getValidImgURI } from "@/utils/media.utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { NativeStackScreenProps } from "react-native-screens/native-stack";

const ProfileView = ({
    route,
    navigation,
}: NativeStackScreenProps<
    EncounterStackParamList,
    typeof ROUTES.Main.ProfileView
>) => {
    const width = Dimensions.get("window").width;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselRef = useRef<ICarouselInstance>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [validImageURIs, setValidImageURIs] = useState<string[]>([]);

    const handleProgressChange = useCallback(
        (_: number, absoluteProgress: number) => {
            const index =
                Math.floor(absoluteProgress) % (validImageURIs.length || 1);
            setCurrentImageIndex(index);
        },
        [validImageURIs.length],
    );

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
        setIsMounted(true);
        const parent = navigation.getParent();

        // Validate and filter image URIs
        if (user.imageURIs) {
            const validURIs = user.imageURIs.map(getValidImgURI);
            setValidImageURIs(validURIs);
        }

        if (parent) {
            parent.setOptions({
                headerLeft: () => (
                    <OPageHeader title={`${user.firstName}, ${user.age}`} />
                ),
            });
        }

        return () => {
            setIsMounted(false);
            if (parent) {
                parent.setOptions({
                    headerLeft: () => <OPageHeaderEncounters />,
                });
            }
        };
    }, [navigation, user.firstName, user.age, user.imageURIs]);

    if (!isMounted) {
        return <OLoadingSpinner />;
    }

    const renderCarouselItem = ({
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
                }}
                style={styles.touchableContainer}
            >
                <OImageWithLoader
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    onError={(error) => {
                        console.warn(
                            `Image loading error for URI ${item}:`,
                            error,
                        );
                    }}
                />
            </TouchableOpacity>
        );
    };

    return (
        <OPageContainer
            containerStyle={{ paddingTop: 4 }}
            bottomContainerChildren={bottomContainerChildren}
        >
            <OBadgesOfUser intentions={user.intentions} />
            <Text style={[Subtitle, { marginTop: 6 }]}>{user.bio}</Text>

            <View style={styles.carouselContainer}>
                {validImageURIs.length > 1 ? (
                    <Carousel
                        ref={carouselRef}
                        loop
                        width={width - 32}
                        height={(width - 32) * 0.8}
                        autoPlay={false}
                        data={validImageURIs}
                        scrollAnimationDuration={1000}
                        onProgressChange={handleProgressChange}
                        renderItem={renderCarouselItem}
                    />
                ) : validImageURIs.length === 1 ? (
                    renderCarouselItem({ item: validImageURIs[0], index: 0 })
                ) : (
                    <View style={styles.touchableContainer}>
                        <OImageWithLoader
                            style={styles.carouselImage}
                            resizeMode="cover"
                        />
                    </View>
                )}
                {validImageURIs.length > 1 && (
                    <View style={styles.paginationContainer}>
                        {validImageURIs.map((_, index) => (
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

            {validImageURIs.length > 2 && (
                <FlatList
                    data={validImageURIs}
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
});

export default ProfileView;
