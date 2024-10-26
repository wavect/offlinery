import * as Sentry from "@sentry/react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";

interface CompressImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

/**
 * Compresses an image while maintaining aspect ratio
 * @param image The image asset to compress
 * @param options Compression options
 * @returns Compressed ImagePickerAsset
 */
export const compressImage = async (
    image: ImagePickerAsset,
    options: CompressImageOptions = {},
): Promise<ImagePickerAsset> => {
    const { maxWidth = 1080, maxHeight = 1080, quality = 0.7 } = options;

    // Calculate new dimensions while maintaining aspect ratio
    let newWidth = image.width;
    let newHeight = image.height;

    if (newWidth > maxWidth) {
        const ratio = maxWidth / newWidth;
        newWidth = maxWidth;
        newHeight = Math.floor(newHeight * ratio);
    }

    if (newHeight > maxHeight) {
        const ratio = maxHeight / newHeight;
        newHeight = maxHeight;
        newWidth = Math.floor(newWidth * ratio);
    }

    try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            image.uri,
            [{ resize: { width: newWidth, height: newHeight } }],
            {
                compress: quality,
                format: ImageManipulator.SaveFormat.JPEG,
            },
        );

        // Convert to ImagePickerAsset format
        return {
            ...image,
            uri:
                Platform.OS === "ios"
                    ? manipulatedImage.uri.replace("file://", "")
                    : manipulatedImage.uri,
            width: manipulatedImage.width,
            height: manipulatedImage.height,
        };
    } catch (error) {
        console.error("Error compressing image:", error);
        Sentry.captureException(error, {
            tags: {
                imageService: "compressImage",
            },
        });
        return image; // @dev return original image in case of failure
    }
};

/**
 * Compresses multiple images in parallel
 * @param images Array of image assets to compress
 * @param options Compression options
 * @returns Array of compressed ImagePickerAsset
 */
export const compressImages = async (
    images: ImagePickerAsset[],
    options?: CompressImageOptions,
): Promise<ImagePickerAsset[]> => {
    try {
        const compressionPromises = images.map((image) =>
            compressImage(image, options),
        );
        return await Promise.all(compressionPromises);
    } catch (error) {
        console.error("Error compressing multiple images:", error);
        Sentry.captureException(error, {
            tags: {
                imageService: "compressImages",
                amountImages: images?.length,
            },
        });

        // @dev silently fail (log to sentry) and return uncompressed images
        return images;
    }
};
