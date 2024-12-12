import { OLoadingSpinner } from "@/components/OLoadingCircle/OLoadingCircle";
import {
    EACTION_USER,
    ImageIdx,
    IUserAction,
    IUserData,
} from "@/context/UserContext";
import { BorderRadius, Color } from "@/GlobalStyles";
import { i18n, TR } from "@/localization/translate.service";
import { compressImage } from "@/services/image.service";
import { getValidImgURI } from "@/utils/media.utils";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

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

    const [isLoading, setLoading] = useState(false);

    const openMediaLibrary = async () => {
        setLoading(true);
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
                const image = await compressImage(result.assets[0]);

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
        setLoading(false);
    };

    const removeImage = () => {
        dispatch({
            type: EACTION_USER.UPDATE_MULTIPLE,
            payload: {
                imageURIs: {
                    ...state.imageURIs,
                    [imageIdx]: null,
                },
                removeStatus: true,
            },
        });
    };

    const img = state.imageURIs[imageIdx];
    const imageContainerContent = !img ? (
        <MaterialIcons
            name="add-circle-outline"
            size={size * 0.2}
            color={Color.primary}
        />
    ) : (
        <Image
            style={styles.previewImage}
            source={{ uri: getValidImgURI(img) }}
        />
    );

    return (
        <View style={[styles.photoContainer, { width: size, height: size }]}>
            <Pressable style={styles.photoContent} onPress={openMediaLibrary}>
                {isLoading ? <OLoadingSpinner /> : imageContainerContent}
            </Pressable>
            {img && (
                <Pressable style={styles.removeButton} onPress={removeImage}>
                    <MaterialIcons
                        name="close"
                        size={size * 0.15}
                        color={Color.white}
                    />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    photoContent: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    removeButton: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: Color.redDark,
        borderRadius: 15,
        padding: 2,
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
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: BorderRadius.br_5xs,
    },
});
