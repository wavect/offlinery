import { BorderRadius, Color } from "@/GlobalStyles";
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
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";

interface IPhotoContainerProps {
    imageIdx: ImageIdx;
    dispatch: React.Dispatch<IUserAction>;
    state: IUserData;
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

    if (!img) {
        return (
            <Pressable style={styles.photoContainer} onPress={openMediaLibrary}>
                <MaterialIcons
                    name="add-circle-outline"
                    size={30}
                    color={Color.primary}
                />
            </Pressable>
        );
    }

    // If the image is an `ImagePicker` we can directly access image on the user's device
    // otherwise we need to fetch it from the server.
    const uri = isImagePicker(img)
        ? img.uri
        : `${BASE_PATH.replace("/v1", "")}/img/${img}`;

    return (
        <Pressable style={styles.photoContainer} onPress={openMediaLibrary}>
            <Image style={styles.previewImage} source={{ uri }} />
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

    return (
        <OPageContainer
            title={i18n.t(TR.addPhotos)}
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
                <View style={styles.row}>
                    <PhotoContainer
                        imageIdx="0"
                        dispatch={dispatch}
                        state={state}
                        mediaStatus={mediaLibStatus}
                        requestMediaLibPermission={requestMediaLibPermission}
                    />
                    <PhotoContainer
                        imageIdx="1"
                        dispatch={dispatch}
                        state={state}
                        mediaStatus={mediaLibStatus}
                        requestMediaLibPermission={requestMediaLibPermission}
                    />
                </View>
                <View style={styles.row}>
                    <PhotoContainer
                        imageIdx="2"
                        dispatch={dispatch}
                        state={state}
                        mediaStatus={mediaLibStatus}
                        requestMediaLibPermission={requestMediaLibPermission}
                    />
                    <PhotoContainer
                        imageIdx="3"
                        dispatch={dispatch}
                        state={state}
                        mediaStatus={mediaLibStatus}
                        requestMediaLibPermission={requestMediaLibPermission}
                    />
                </View>
                <View style={styles.row}>
                    <PhotoContainer
                        imageIdx="4"
                        dispatch={dispatch}
                        state={state}
                        mediaStatus={mediaLibStatus}
                        requestMediaLibPermission={requestMediaLibPermission}
                    />
                    <PhotoContainer
                        imageIdx="5"
                        dispatch={dispatch}
                        state={state}
                        mediaStatus={mediaLibStatus}
                        requestMediaLibPermission={requestMediaLibPermission}
                    />
                </View>
            </View>
        </OPageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: BorderRadius.br_5xs,
    },
    photoContainer: {
        width: 150,
        height: 150,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: BorderRadius.br_5xs,
        borderColor: Color.primary,
        borderStyle: "dashed",
        backgroundColor: Color.brightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    plusIcon: {
        width: 30,
        height: 30,
    },
});

export default AddPhotos;
