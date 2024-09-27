import { BASE_PATH } from "@/api/gen/src";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";

/** @dev Supports remote URIs and locally saved images via ImagePicker
 * @returns Valid Img URI which might be local or absolute/full URI on a remote server */
export const getValidImgURI = (
    img: ImagePicker.ImagePickerAsset | string,
): string => {
    // If the image is an `ImagePicker` we can directly access image on the user's device
    // otherwise we need to fetch it from the server.
    return isImagePicker(img)
        ? img.uri
        : `${BASE_PATH.replace("/v1", "")}/img/${img}`;
};

export const isImagePicker = (
    image: ImagePickerAsset | string | undefined,
): image is ImagePickerAsset => {
    return (
        image !== undefined &&
        typeof image === "object" &&
        image !== null &&
        "uri" in image
    );
};
