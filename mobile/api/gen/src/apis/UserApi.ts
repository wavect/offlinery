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
    LocationDTO,
    RequestAccountDeletionViaFormDTO,
    ResetPasswordRequestDTO,
    ResetPasswordResponseDTO,
    SignInResponseDTO,
    UpdateUserDTO,
    UpdateUserPasswordDTO,
    UserCountDTO,
    UserPrivateDTO,
    UserPublicDTO,
    UserResetPwdSuccessDTO,
    VerifyResetPasswordDTO,
} from "../models/index";
import {
    CreateUserDTOToJSON,
    LocationDTOToJSON,
    RequestAccountDeletionViaFormDTOToJSON,
    ResetPasswordRequestDTOToJSON,
    ResetPasswordResponseDTOFromJSON,
    SignInResponseDTOFromJSON,
    UpdateUserDTOToJSON,
    UpdateUserPasswordDTOToJSON,
    UserCountDTOFromJSON,
    UserPrivateDTOFromJSON,
    UserPublicDTOFromJSON,
    UserResetPwdSuccessDTOFromJSON,
    VerifyResetPasswordDTOToJSON,
} from "../models/index";
import * as runtime from "../runtime";

// We import this type even if it's unused to avoid additional
// template rendering logic. If the drawbacks of this approach
// are larger than the benefits, we can try another approach.
import { ImagePickerAsset } from "expo-image-picker";
export interface UserControllerCreateUserRequest {
    createUserDTO: CreateUserDTO;
    images: (ImagePickerAsset | undefined)[];
}

export interface UserControllerDeleteUserRequest {
    deletionToken: string;
}

export interface UserControllerGetOwnUserDataRequest {
    userId: string;
}

export interface UserControllerRequestAccountDeletionRequest {
    userId: string;
}

export interface UserControllerRequestAccountDeletionViaFormRequest {
    requestAccountDeletionViaFormDTO: RequestAccountDeletionViaFormDTO;
}

export interface UserControllerRequestPasswordChangeAsForgottenRequest {
    resetPasswordRequestDTO: ResetPasswordRequestDTO;
}

export interface UserControllerResetPasswordRequest {
    verifyResetPasswordDTO: VerifyResetPasswordDTO;
}

export interface UserControllerUpdateLocationRequest {
    userId: string;
    locationDTO: LocationDTO;
}

export interface UserControllerUpdateUserRequest {
    userId: string;
    updateUserDTO?: UpdateUserDTO;
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
     * @param {CreateUserDTO} createUserDTO
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
     * @summary Deletion of user account
     * @param {string} deletionToken Unique, one time and expiring deletion token
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerDeleteUserRaw(
        requestParameters: UserControllerDeleteUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>>;

    /**
     * Deletion of user account
     */
    userControllerDeleteUser(
        requestParameters: UserControllerDeleteUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void>;

    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerGetAccountDeletionFormRaw(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>>;

    /**
     */
    userControllerGetAccountDeletionForm(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void>;

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
     * @summary Get user count
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerGetUserCountRaw(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserCountDTO>>;

    /**
     * Get user count
     */
    userControllerGetUserCount(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserCountDTO>;

    /**
     *
     * @summary Request deletion of user account
     * @param {string} userId User ID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerRequestAccountDeletionRaw(
        requestParameters: UserControllerRequestAccountDeletionRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>>;

    /**
     * Request deletion of user account
     */
    userControllerRequestAccountDeletion(
        requestParameters: UserControllerRequestAccountDeletionRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void>;

    /**
     *
     * @summary Request deletion of user account
     * @param {RequestAccountDeletionViaFormDTO} requestAccountDeletionViaFormDTO
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerRequestAccountDeletionViaFormRaw(
        requestParameters: UserControllerRequestAccountDeletionViaFormRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>>;

    /**
     * Request deletion of user account
     */
    userControllerRequestAccountDeletionViaForm(
        requestParameters: UserControllerRequestAccountDeletionViaFormRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void>;

    /**
     *
     * @summary Request change password of user account
     * @param {ResetPasswordRequestDTO} resetPasswordRequestDTO User email and reset code sent via email.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerRequestPasswordChangeAsForgottenRaw(
        requestParameters: UserControllerRequestPasswordChangeAsForgottenRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<ResetPasswordResponseDTO>>;

    /**
     * Request change password of user account
     */
    userControllerRequestPasswordChangeAsForgotten(
        requestParameters: UserControllerRequestPasswordChangeAsForgottenRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<ResetPasswordResponseDTO>;

    /**
     *
     * @summary Reset password of user account
     * @param {VerifyResetPasswordDTO} verifyResetPasswordDTO User email and reset code sent via email including new chosen password.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerResetPasswordRaw(
        requestParameters: UserControllerResetPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserResetPwdSuccessDTO>>;

    /**
     * Reset password of user account
     */
    userControllerResetPassword(
        requestParameters: UserControllerResetPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserResetPwdSuccessDTO>;

    /**
     *
     * @summary Update user location
     * @param {string} userId User ID
     * @param {LocationDTO} locationDTO
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
     * @param {UpdateUserDTO} [updateUserDTO]
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
        if (requestParameters["createUserDTO"] == null) {
            throw new runtime.RequiredError(
                "createUserDTO",
                'Required parameter "createUserDTO" was null or undefined when calling userControllerCreateUser().',
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

        if (requestParameters["createUserDTO"] != null) {
            formParams.append("createUserDTO", [
                JSON.stringify(
                    CreateUserDTOToJSON(requestParameters["createUserDTO"]),
                ),
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
     * Deletion of user account
     */
    async userControllerDeleteUserRaw(
        requestParameters: UserControllerDeleteUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>> {
        if (requestParameters["deletionToken"] == null) {
            throw new runtime.RequiredError(
                "deletionToken",
                'Required parameter "deletionToken" was null or undefined when calling userControllerDeleteUser().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user/delete/{deletionToken}`.replace(
                    `{${"deletionToken"}}`,
                    encodeURIComponent(
                        String(requestParameters["deletionToken"]),
                    ),
                ),
                method: "GET",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletion of user account
     */
    async userControllerDeleteUser(
        requestParameters: UserControllerDeleteUserRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void> {
        await this.userControllerDeleteUserRaw(
            requestParameters,
            initOverrides,
        );
    }

    /**
     */
    async userControllerGetAccountDeletionFormRaw(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user/request-deletion`,
                method: "GET",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async userControllerGetAccountDeletionForm(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void> {
        await this.userControllerGetAccountDeletionFormRaw(initOverrides);
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
                path: `/user/data/{userId}`.replace(
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
     * Get user count
     */
    async userControllerGetUserCountRaw(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserCountDTO>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user/user-count`,
                method: "GET",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserCountDTOFromJSON(jsonValue),
        );
    }

    /**
     * Get user count
     */
    async userControllerGetUserCount(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserCountDTO> {
        const response =
            await this.userControllerGetUserCountRaw(initOverrides);
        return await response.value();
    }

    /**
     * Request deletion of user account
     */
    async userControllerRequestAccountDeletionRaw(
        requestParameters: UserControllerRequestAccountDeletionRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>> {
        if (requestParameters["userId"] == null) {
            throw new runtime.RequiredError(
                "userId",
                'Required parameter "userId" was null or undefined when calling userControllerRequestAccountDeletion().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user/request-deletion/{userId}`.replace(
                    `{${"userId"}}`,
                    encodeURIComponent(String(requestParameters["userId"])),
                ),
                method: "PUT",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Request deletion of user account
     */
    async userControllerRequestAccountDeletion(
        requestParameters: UserControllerRequestAccountDeletionRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void> {
        await this.userControllerRequestAccountDeletionRaw(
            requestParameters,
            initOverrides,
        );
    }

    /**
     * Request deletion of user account
     */
    async userControllerRequestAccountDeletionViaFormRaw(
        requestParameters: UserControllerRequestAccountDeletionViaFormRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<void>> {
        if (requestParameters["requestAccountDeletionViaFormDTO"] == null) {
            throw new runtime.RequiredError(
                "requestAccountDeletionViaFormDTO",
                'Required parameter "requestAccountDeletionViaFormDTO" was null or undefined when calling userControllerRequestAccountDeletionViaForm().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/user/request-deletion`,
                method: "POST",
                headers: headerParameters,
                query: queryParameters,
                body: RequestAccountDeletionViaFormDTOToJSON(
                    requestParameters["requestAccountDeletionViaFormDTO"],
                ),
            },
            initOverrides,
        );

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Request deletion of user account
     */
    async userControllerRequestAccountDeletionViaForm(
        requestParameters: UserControllerRequestAccountDeletionViaFormRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<void> {
        await this.userControllerRequestAccountDeletionViaFormRaw(
            requestParameters,
            initOverrides,
        );
    }

    /**
     * Request change password of user account
     */
    async userControllerRequestPasswordChangeAsForgottenRaw(
        requestParameters: UserControllerRequestPasswordChangeAsForgottenRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<ResetPasswordResponseDTO>> {
        if (requestParameters["resetPasswordRequestDTO"] == null) {
            throw new runtime.RequiredError(
                "resetPasswordRequestDTO",
                'Required parameter "resetPasswordRequestDTO" was null or undefined when calling userControllerRequestPasswordChangeAsForgotten().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/user/password-forgotten`,
                method: "PUT",
                headers: headerParameters,
                query: queryParameters,
                body: ResetPasswordRequestDTOToJSON(
                    requestParameters["resetPasswordRequestDTO"],
                ),
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            ResetPasswordResponseDTOFromJSON(jsonValue),
        );
    }

    /**
     * Request change password of user account
     */
    async userControllerRequestPasswordChangeAsForgotten(
        requestParameters: UserControllerRequestPasswordChangeAsForgottenRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<ResetPasswordResponseDTO> {
        const response =
            await this.userControllerRequestPasswordChangeAsForgottenRaw(
                requestParameters,
                initOverrides,
            );
        return await response.value();
    }

    /**
     * Reset password of user account
     */
    async userControllerResetPasswordRaw(
        requestParameters: UserControllerResetPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserResetPwdSuccessDTO>> {
        if (requestParameters["verifyResetPasswordDTO"] == null) {
            throw new runtime.RequiredError(
                "verifyResetPasswordDTO",
                'Required parameter "verifyResetPasswordDTO" was null or undefined when calling userControllerResetPassword().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/user/reset-password`,
                method: "PUT",
                headers: headerParameters,
                query: queryParameters,
                body: VerifyResetPasswordDTOToJSON(
                    requestParameters["verifyResetPasswordDTO"],
                ),
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserResetPwdSuccessDTOFromJSON(jsonValue),
        );
    }

    /**
     * Reset password of user account
     */
    async userControllerResetPassword(
        requestParameters: UserControllerResetPasswordRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserResetPwdSuccessDTO> {
        const response = await this.userControllerResetPasswordRaw(
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

        if (requestParameters["locationDTO"] == null) {
            throw new runtime.RequiredError(
                "locationDTO",
                'Required parameter "locationDTO" was null or undefined when calling userControllerUpdateLocation().',
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
                body: LocationDTOToJSON(requestParameters["locationDTO"]),
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

        if (requestParameters["updateUserDTO"] != null) {
            formParams.append("updateUserDTO", [
                JSON.stringify(
                    UpdateUserDTOToJSON(requestParameters["updateUserDTO"]),
                ),
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
                path: `/user/data/{userId}`.replace(
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
