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


import * as runtime from '../runtime';
import type {
  CreateUserDTO,
  UpdateUserDTO,
  User,
  UserPublicDTO,
} from '../models/index';
import {
    CreateUserDTOFromJSON,
    CreateUserDTOToJSON,
    UpdateUserDTOFromJSON,
    UpdateUserDTOToJSON,
    UserFromJSON,
    UserToJSON,
    UserPublicDTOFromJSON,
    UserPublicDTOToJSON,
} from '../models/index';

export interface UserControllerCreateUserRequest {
    user: CreateUserDTO;
    images: Array<Blob>;
}

export interface UserControllerGetUserRequest {
    id: number;
}

export interface UserControllerUpdateUserRequest {
    id: string;
    user?: UpdateUserDTO;
    images?: Array<Blob>;
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
    userControllerCreateUserRaw(requestParameters: UserControllerCreateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPublicDTO>>;

    /**
     * Create a new user with images
     */
    userControllerCreateUser(requestParameters: UserControllerCreateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPublicDTO>;

    /**
     * 
     * @summary Get a user by ID
     * @param {number} id User ID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerGetUserRaw(requestParameters: UserControllerGetUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>>;

    /**
     * Get a user by ID
     */
    userControllerGetUser(requestParameters: UserControllerGetUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User>;

    /**
     * 
     * @summary Update an existing user
     * @param {string} id 
     * @param {UpdateUserDTO} [user] 
     * @param {Array<Blob>} [images] An array of image files
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApiInterface
     */
    userControllerUpdateUserRaw(requestParameters: UserControllerUpdateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPublicDTO>>;

    /**
     * Update an existing user
     */
    userControllerUpdateUser(requestParameters: UserControllerUpdateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPublicDTO>;

}

/**
 * 
 */
export class UserApi extends runtime.BaseAPI implements UserApiInterface {

    /**
     * Create a new user with images
     */
    async userControllerCreateUserRaw(requestParameters: UserControllerCreateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPublicDTO>> {
        if (requestParameters['user'] == null) {
            throw new runtime.RequiredError(
                'user',
                'Required parameter "user" was null or undefined when calling userControllerCreateUser().'
            );
        }

        if (requestParameters['images'] == null) {
            throw new runtime.RequiredError(
                'images',
                'Required parameter "images" was null or undefined when calling userControllerCreateUser().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
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

        if (requestParameters['user'] != null) {
            formParams.append('user', new Blob([JSON.stringify(CreateUserDTOToJSON(requestParameters['user']))], { type: "application/json", }));
                    }

        if (requestParameters['images'] != null) {
            requestParameters['images'].forEach((element) => {
                formParams.append('images', element as any);
            })
        }

        const response = await this.request({
            path: `/user/create`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPublicDTOFromJSON(jsonValue));
    }

    /**
     * Create a new user with images
     */
    async userControllerCreateUser(requestParameters: UserControllerCreateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPublicDTO> {
        const response = await this.userControllerCreateUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get a user by ID
     */
    async userControllerGetUserRaw(requestParameters: UserControllerGetUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling userControllerGetUser().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/user/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Get a user by ID
     */
    async userControllerGetUser(requestParameters: UserControllerGetUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.userControllerGetUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update an existing user
     */
    async userControllerUpdateUserRaw(requestParameters: UserControllerUpdateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPublicDTO>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling userControllerUpdateUser().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
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

        if (requestParameters['user'] != null) {
            formParams.append('user', new Blob([JSON.stringify(UpdateUserDTOToJSON(requestParameters['user']))], { type: "application/json", }));
                    }

        if (requestParameters['images'] != null) {
            requestParameters['images'].forEach((element) => {
                formParams.append('images', element as any);
            })
        }

        const response = await this.request({
            path: `/user/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPublicDTOFromJSON(jsonValue));
    }

    /**
     * Update an existing user
     */
    async userControllerUpdateUser(requestParameters: UserControllerUpdateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPublicDTO> {
        const response = await this.userControllerUpdateUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
