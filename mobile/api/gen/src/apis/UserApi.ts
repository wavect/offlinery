/* tslint:disable */
/* eslint-disable */
/**
 * Offlinery
 * API of Offlinery
 *
 * The version of the OpenAPI document: 1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type {
    CreateUserDTO,
    LocationUpdateDTO,
    SignInResponseDTO,
    UpdateUserDTO,
    UpdateUserPasswordDTO,
    UserPrivateDTO,
    UserPublicDTO,
} from "../models/index";
import {
    CreateUserDTOToJSON,
    LocationUpdateDTOToJSON,
    SignInResponseDTOFromJSON,
    UpdateUserDTOToJSON,
    UpdateUserPasswordDTOToJSON,
    UserPrivateDTOFromJSON,
    UserPublicDTOFromJSON,
} from "../models/index";
import * as runtime from "../runtime";

// We import this type even if it's unused to avoid additional
// template rendering logic. If the drawbacks of this approach
// are larger than the benefits, we can try another approach.
import { ImagePickerAsset } from "expo-image-picker";
export interface UserControllerCreateUserRequest {
    user: CreateUserDTO;
    images: (ImagePickerAsset | undefined)[];
}

export interface UserControllerGetOwnUserDataRequest {
    userId: string;
}

export interface UserControllerUpdateLocationRequest {
    userId: string;
    locationUpdateDTO: LocationUpdateDTO;
}

export interface UserControllerUpdateUserRequest {
    userId: string;
    user?: UpdateUserDTO;
    images?: (ImagePickerAsset | undefined)[];
}

export interface UserControllerUpdateUserPasswordRequest {
    userId: string;
    updateUserPasswordDTO: UpdateUserPasswordDTO;
}

/**
 * UserApi - interface
 *
 * @export
 * @interface UserApiInterface
 */
export interface UserApiInterface {
    /**
     *
     * @summary Create a new user with images
     * @param {CreateUserDTO} user
     * @param {Array<Blob>} images An array of image files
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerCreateUserRaw(
        requestParameters: UserControllerCreateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<SignInResponseDTO>>;

    /**
     * Create a new user with images
     */
    userControllerCreateUser(
        requestParameters: UserControllerCreateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<SignInResponseDTO>;

    /**
     *
     * @summary Get private user data by ID
     * @param {string} userId User ID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerGetOwnUserDataRaw(
        requestParameters: UserControllerGetOwnUserDataRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPrivateDTO>>;

    /**
     * Get private user data by ID
     */
    userControllerGetOwnUserData(
        requestParameters: UserControllerGetOwnUserDataRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPrivateDTO>;

    /**
     *
     * @summary Update user location
     * @param {string} userId User ID
     * @param {LocationUpdateDTO} locationUpdateDTO
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerUpdateLocationRaw(
        requestParameters: UserControllerUpdateLocationRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPublicDTO>>;

    /**
     * Update user location
     */
    userControllerUpdateLocation(
        requestParameters: UserControllerUpdateLocationRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPublicDTO>;

    /**
     *
     * @summary Update an existing user
     * @param {string} userId
     * @param {UpdateUserDTO} [user]
     * @param {Array<Blob>} [images] An array of image files
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerUpdateUserRaw(
        requestParameters: UserControllerUpdateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPublicDTO>>;

    /**
     * Update an existing user
     */
    userControllerUpdateUser(
        requestParameters: UserControllerUpdateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPublicDTO>;

    /**
     *
     * @summary Update user password
     * @param {string} userId
     * @param {UpdateUserPasswordDTO} updateUserPasswordDTO
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerUpdateUserPasswordRaw(
        requestParameters: UserControllerUpdateUserPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPublicDTO>>;

    /**
     * Update user password
     */
    userControllerUpdateUserPassword(
        requestParameters: UserControllerUpdateUserPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPublicDTO>;
}

/**
 *
 */
export class UserApi extends runtime.BaseAPI implements UserApiInterface {
    /**
     * Create a new user with images
     */
    async userControllerCreateUserRaw(
        requestParameters: UserControllerCreateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<SignInResponseDTO>> {
        if (requestParameters["user"] == null) {
            throw new runtime.RequiredError(
                "user",
                'Required parameter "user" was null or undefined when calling userControllerCreateUser().',
            );
        }

        if (requestParameters["images"] == null) {
            throw new runtime.RequiredError(
                "images",
                'Required parameter "images" was null or undefined when calling userControllerCreateUser().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const consumes: runtime.Consume[] = [
            { contentType: "multipart/form-data" },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters["user"] != null) {
            formParams.append("user", [
                JSON.stringify(CreateUserDTOToJSON(requestParameters["user"])),
            ]);
        }

        const files = requestParameters["images"];
        if (files) {
            const filteredFiles = Object.keys(files)
                .filter((key) => files[key] !== undefined)
                .map((key) => files[key]);

            for (const file of filteredFiles) {
                formParams.append("images", {
                    uri: file.uri,
                    name: file.fileName,
                    type: file.mimeType,
                });
            }
        }
        const response = await this.request(
            {
                path: `/user/create`,
                method: "POST",
                headers: headerParameters,
                query: queryParameters,
                body: formParams,
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            SignInResponseDTOFromJSON(jsonValue),
        );
    }

    /**
     * Create a new user with images
     */
    async userControllerCreateUser(
        requestParameters: UserControllerCreateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<SignInResponseDTO> {
        const response = await this.userControllerCreateUserRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }

    /**
     * Get private user data by ID
     */
    async userControllerGetOwnUserDataRaw(
        requestParameters: UserControllerGetOwnUserDataRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPrivateDTO>> {
        if (requestParameters["userId"] == null) {
            throw new runtime.RequiredError(
                "userId",
                'Required parameter "userId" was null or undefined when calling userControllerGetOwnUserData().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user/{userId}`.replace(
                    `{${"userId"}}`,
                    encodeURIComponent(String(requestParameters["userId"])),
                ),
                method: "GET",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserPrivateDTOFromJSON(jsonValue),
        );
    }

    /**
     * Get private user data by ID
     */
    async userControllerGetOwnUserData(
        requestParameters: UserControllerGetOwnUserDataRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPrivateDTO> {
        const response = await this.userControllerGetOwnUserDataRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }

    /**
     * Update user location
     */
    async userControllerUpdateLocationRaw(
        requestParameters: UserControllerUpdateLocationRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPublicDTO>> {
        if (requestParameters["userId"] == null) {
            throw new runtime.RequiredError(
                "userId",
                'Required parameter "userId" was null or undefined when calling userControllerUpdateLocation().',
            );
        }

        if (requestParameters["locationUpdateDTO"] == null) {
            throw new runtime.RequiredError(
                "locationUpdateDTO",
                'Required parameter "locationUpdateDTO" was null or undefined when calling userControllerUpdateLocation().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/user/location/{userId}`.replace(
                    `{${"userId"}}`,
                    encodeURIComponent(String(requestParameters["userId"])),
                ),
                method: "PUT",
                headers: headerParameters,
                query: queryParameters,
                body: LocationUpdateDTOToJSON(
                    requestParameters["locationUpdateDTO"],
                ),
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserPublicDTOFromJSON(jsonValue),
        );
    }

    /**
     * Update user location
     */
    async userControllerUpdateLocation(
        requestParameters: UserControllerUpdateLocationRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPublicDTO> {
        const response = await this.userControllerUpdateLocationRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }

    /**
     * Update an existing user
     */
    async userControllerUpdateUserRaw(
        requestParameters: UserControllerUpdateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPublicDTO>> {
        if (requestParameters["userId"] == null) {
            throw new runtime.RequiredError(
                "userId",
                'Required parameter "userId" was null or undefined when calling userControllerUpdateUser().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const consumes: runtime.Consume[] = [
            { contentType: "multipart/form-data" },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters["user"] != null) {
            formParams.append("user", [
                JSON.stringify(UpdateUserDTOToJSON(requestParameters["user"])),
            ]);
        }

        const files = requestParameters["images"];
        if (files) {
            const filteredFiles = Object.keys(files)
                .filter((key) => files[key] !== undefined)
                .map((key) => files[key]);

            for (const file of filteredFiles) {
                formParams.append("images", {
                    uri: file.uri,
                    name: file.fileName,
                    type: file.mimeType,
                });
            }
        }
        const response = await this.request(
            {
                path: `/user/{userId}`.replace(
                    `{${"userId"}}`,
                    encodeURIComponent(String(requestParameters["userId"])),
                ),
                method: "PUT",
                headers: headerParameters,
                query: queryParameters,
                body: formParams,
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserPublicDTOFromJSON(jsonValue),
        );
    }

    /**
     * Update an existing user
     */
    async userControllerUpdateUser(
        requestParameters: UserControllerUpdateUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPublicDTO> {
        const response = await this.userControllerUpdateUserRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }

    /**
     * Update user password
     */
    async userControllerUpdateUserPasswordRaw(
        requestParameters: UserControllerUpdateUserPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserPublicDTO>> {
        if (requestParameters["userId"] == null) {
            throw new runtime.RequiredError(
                "userId",
                'Required parameter "userId" was null or undefined when calling userControllerUpdateUserPassword().',
            );
        }

        if (requestParameters["updateUserPasswordDTO"] == null) {
            throw new runtime.RequiredError(
                "updateUserPasswordDTO",
                'Required parameter "updateUserPasswordDTO" was null or undefined when calling userControllerUpdateUserPassword().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/user/changePwd/{userId}`.replace(
                    `{${"userId"}}`,
                    encodeURIComponent(String(requestParameters["userId"])),
                ),
                method: "PUT",
                headers: headerParameters,
                query: queryParameters,
                body: UpdateUserPasswordDTOToJSON(
                    requestParameters["updateUserPasswordDTO"],
                ),
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserPublicDTOFromJSON(jsonValue),
        );
    }

    /**
     * Update user password
     */
    async userControllerUpdateUserPassword(
        requestParameters: UserControllerUpdateUserPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserPublicDTO> {
        const response = await this.userControllerUpdateUserPasswordRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }
}
