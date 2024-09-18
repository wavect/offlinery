import { BorderRadius, Color } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { UserApi } from "@/api/gen/src";
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
import { includeJWT } from "@/utils/misc.utils";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import * as React from "react";
import { useState } from "react";
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
    const uri = isImagePicker(img) ? img.uri : img;

    return (
        <Pressable
            style={[styles.photoContainer, { width: size, height: size }]}
            onPress={openMediaLibrary}
        >
            {!img ? (
                <MaterialIcons
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

const userApi = new UserApi();
const AddPhotos = ({
    route,
    navigation,
}: NativeStackScreenProps<
    MainStackParamList,
    typeof ROUTES.Onboarding.AddPhotos
>) => {
    const [mediaLibStatus, requestMediaLibPermission] =
        ImagePicker.useMediaLibraryPermissions();
    const [isLoading, setLoading] = useState(false);
    const { state, dispatch } = useUserContext();
    const hasAnyImage = Object.values(state.imageURIs).some(Boolean);

    const { width } = useWindowDimensions();

    // Calculate the size of each photo container based on screen width
    const containerPadding = 20;
    const gapBetweenContainers = 10;
    const photoContainerSize =
        (width - 2 * containerPadding - gapBetweenContainers) / 2;

    const onSave = async () => {
        if (route.params?.overrideOnBtnPress) {
            setLoading(true);
            try {
                await userApi.userControllerUpdateUser(
                    {
                        userId: state.id!,
                        images: (["0", "1", "2", "3", "4", "5"] as ImageIdx[])
                            .map((idx) => {
                                const img = state.imageURIs[idx];
                                if (isImagePicker(img)) {
                                    return img;
                                }
                                // otherwise do not upload (only blobs)
                                return;
                            })
                            .filter(
                                (i): i is ImagePickerAsset => i !== undefined,
                            ),
                    },
                    await includeJWT(),
                );
                route.params.overrideOnBtnPress();
            } catch (err) {
                throw err;
            } finally {
                setLoading(false);
            }
        } else {
            // @dev Saved on account creation
            navigation.navigate(ROUTES.HouseRules, {
                nextPage: ROUTES.Onboarding.ApproachChoice,
            });
        }
    };

    return (
        <OPageContainer
            bottomContainerChildren={
                <OButtonWide
                    text={
                        route.params?.overrideSaveBtnLbl || i18n.t(TR.continue)
                    }
                    isLoading={isLoading}
                    loadingBtnText={i18n.t(TR.updating)}
                    filled={true}
                    variant="dark"
                    disabled={!hasAnyImage}
                    onPress={onSave}
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
        borderRadius: BorderRadius.br_5xs,
    },
    photoContainer: {
        marginBottom: 5,
        borderWidth: 1,
        borderRadius: BorderRadius.br_5xs,
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
