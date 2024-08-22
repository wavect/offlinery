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
  User,
} from '../models/index';
import {
    UserFromJSON,
    UserToJSON,
} from '../models/index';

// We import this type even if it's unused to avoid additional
// template rendering logic. If the drawbacks of this approach
// are larger than the benefits, we can try another approach.
import { ImagePickerAsset } from "expo-image-picker";
export interface EncounterControllerGetEncounterRequest {
    id: number;
}

export interface EncounterControllerGetEncountersByUserRequest {
    userId: string;
    id: number;
}

/**
 * EncounterApi - interface
 * 
 * @export
 * @interface EncounterApiInterface
 */
export interface EncounterApiInterface {
    /**
     * 
     * @summary Get a encounter by ID
     * @param {number} id Encounter ID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EncounterApiInterface
     */
    encounterControllerGetEncounterRaw(requestParameters: EncounterControllerGetEncounterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>>;

    /**
     * Get a encounter by ID
     */
    encounterControllerGetEncounter(requestParameters: EncounterControllerGetEncounterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User>;

    /**
     * 
     * @summary Get a encounters of user
     * @param {string} userId 
     * @param {number} id Encounter ID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EncounterApiInterface
     */
    encounterControllerGetEncountersByUserRaw(requestParameters: EncounterControllerGetEncountersByUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>>;

    /**
     * Get a encounters of user
     */
    encounterControllerGetEncountersByUser(requestParameters: EncounterControllerGetEncountersByUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User>;

}

/**
 * 
 */
export class EncounterApi extends runtime.BaseAPI implements EncounterApiInterface {

    /**
     * Get a encounter by ID
     */
    async encounterControllerGetEncounterRaw(requestParameters: EncounterControllerGetEncounterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling encounterControllerGetEncounter().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/encounter/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Get a encounter by ID
     */
    async encounterControllerGetEncounter(requestParameters: EncounterControllerGetEncounterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.encounterControllerGetEncounterRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get a encounters of user
     */
    async encounterControllerGetEncountersByUserRaw(requestParameters: EncounterControllerGetEncountersByUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling encounterControllerGetEncountersByUser().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling encounterControllerGetEncountersByUser().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/encounter/{userId}`.replace(`{${"userId"}}`, encodeURIComponent(String(requestParameters['userId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Get a encounters of user
     */
    async encounterControllerGetEncountersByUser(requestParameters: EncounterControllerGetEncountersByUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.encounterControllerGetEncountersByUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
