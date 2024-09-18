import {
    EACTION_USER,
    ImageIdx,
    isImagePicker,
    IUserAction,
    IUserData,
} from "@/context/UserContext";
import { BorderRadius, Color } from "@/GlobalStyles";
import { i18n, TR } from "@/localization/translate.service";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

interface IPhotoContainerProps {
    imageIdx: ImageIdx;
    dispatch: React.Dispatch<IUserAction>;
    state: IUserData;
    size: number;
    mediaStatus: ImagePicker.MediaLibraryPermissionResponse | null;
    requestMediaLibPermission: () => Promise<ImagePicker.MediaLibraryPermissionResponse>;
}

export const PhotoContainer = (props: IPhotoContainerProps) => {
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

const styles = StyleSheet.create({
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
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: BorderRadius.br_5xs,
    },
});
