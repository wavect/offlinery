import { Color } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { BASE_PATH } from "@/api/gen/src";
import { OButtonWide } from "@/components/OButtonWide/OButtonWide";
import { OPageContainer } from "@/components/OPageContainer/OPageContainer";
import {
    EACTION_USER,
    IUserAction,
    IUserData,
    ImageIdx,
    isImagePicker,
    useUserContext,
} from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { StyledMaterialIcon } from "@/styles/Icon.styles";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

interface IPhotoContainerProps {
    imageIdx: ImageIdx;
    dispatch: React.Dispatch<IUserAction>;
    state: IUserData;
    size: number;
    mediaStatus: ImagePicker.MediaLibraryPermissionResponse | null;
    requestMediaLibPermission: () => Promise<ImagePicker.MediaLibraryPermissionResponse>;
}

const PhotoContainer = (props: IPhotoContainerProps) => {
    const {
        dispatch,
        imageIdx,
        state,
        mediaStatus,
        requestMediaLibPermission,
        size,
    } = props;

    const openMediaLibrary = async () => {
        let mediaAccessGranted = mediaStatus?.granted;
        if (!mediaAccessGranted) {
            mediaAccessGranted = (await requestMediaLibPermission()).granted;
        }
        if (mediaAccessGranted) {
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 1,
                allowsMultipleSelection: false,
            });

            if (!result.canceled) {
                // remove, override, add image
                const image = result.assets[0];
                dispatch({
                    type: EACTION_USER.UPDATE_MULTIPLE,
                    payload: {
                        imageURIs: {
                            ...state.imageURIs,
                            [imageIdx]: { ...image, fileName: imageIdx },
                        },
                    },
                });
            }
        } else {
            alert(i18n.t(TR.noAccessToMediaLib));
        }
    };

    const img = state.imageURIs[imageIdx];

    // If the image is an `ImagePicker` we can directly access image on the user's device
    // otherwise we need to fetch it from the server.
    const uri = isImagePicker(img)
        ? img.uri
        : `${BASE_PATH.replace("/v1", "")}/img/${img}`;

    return (
        <Pressable
            style={[styles.photoContainer, { width: size, height: size }]}
            onPress={openMediaLibrary}
        >
            {!img ? (
                <StyledMaterialIcon
                    name="add-circle-outline"
                    size={size * 0.2}
                    color={Color.primary}
                />
            ) : (
                <Image style={styles.previewImage} source={{ uri }} />
            )}
        </Pressable>
    );
};

const AddPhotos = ({
    route,
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.AddPhotos
>) => {
    const [mediaLibStatus, requestMediaLibPermission] =
        ImagePicker.useMediaLibraryPermissions();
    const { state, dispatch } = useUserContext();
    const hasAnyImage = Object.values(state.imageURIs).some(Boolean);

    const { width } = useWindowDimensions();

    // Calculate the size of each photo container based on screen width
    const containerPadding = 20;
    const gapBetweenContainers = 10;
    const photoContainerSize =
        (width - 2 * containerPadding - gapBetweenContainers) / 2;

    return (
        <OPageContainer
            bottomContainerChildren={
                <OButtonWide
                    text={
                        route.params?.overrideSaveBtnLbl || i18n.t(TR.continue)
                    }
                    filled={true}
                    variant="dark"
                    disabled={!hasAnyImage}
                    onPress={
                        route.params?.overrideOnBtnPress ||
                        (() =>
                            navigation.navigate(ROUTES.HouseRules, {
                                nextPage: ROUTES.Onboarding.ApproachChoice,
                            }))
                    }
                />
            }
            subtitle={i18n.t(TR.clickToUploadImages)}
        >
            <View style={styles.container}>
                {[
                    ["0", "1"],
                    ["2", "3"],
                    ["4", "5"],
                ].map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((idx) => (
                            <PhotoContainer
                                key={idx}
                                imageIdx={idx as ImageIdx}
                                dispatch={dispatch}
                                state={state}
                                mediaStatus={mediaLibStatus}
                                requestMediaLibPermission={
                                    requestMediaLibPermission
                                }
                                size={photoContainerSize}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: 5,
    },
    photoContainer: {
        marginBottom: 5,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Color.primary,
        borderStyle: "dashed",
        backgroundColor: Color.brightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
});

export default AddPhotos;
