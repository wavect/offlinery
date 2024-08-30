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

import type { CreateUserReportDTO, UserReport } from "../models/index";
import { CreateUserReportDTOToJSON, UserReportFromJSON } from "../models/index";
import * as runtime from "../runtime";

// We import this type even if it's unused to avoid additional
// template rendering logic. If the drawbacks of this approach
// are larger than the benefits, we can try another approach.
export interface UserReportControllerCreateRequest {
    createUserReportDTO: CreateUserReportDTO;
}

export interface UserReportControllerFindOneRequest {
    id: string;
}

/**
 * UserReportsApi - interface
 *
 * @export
 * @interface UserReportsApiInterface
 */
export interface UserReportsApiInterface {
    /**
     *
     * @summary Create a new user report
     * @param {CreateUserReportDTO} createUserReportDTO
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserReportsApiInterface
     */
    userReportControllerCreateRaw(
        requestParameters: UserReportControllerCreateRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserReport>>;

    /**
     * Create a new user report
     */
    userReportControllerCreate(
        requestParameters: UserReportControllerCreateRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserReport>;

    /**
     *
     * @summary Get all user reports
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserReportsApiInterface
     */
    userReportControllerFindAllRaw(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<Array<UserReport>>>;

    /**
     * Get all user reports
     */
    userReportControllerFindAll(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<Array<UserReport>>;

    /**
     *
     * @summary Get a user report by id
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserReportsApiInterface
     */
    userReportControllerFindOneRaw(
        requestParameters: UserReportControllerFindOneRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserReport>>;

    /**
     * Get a user report by id
     */
    userReportControllerFindOne(
        requestParameters: UserReportControllerFindOneRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserReport>;
}

/**
 *
 */
export class UserReportsApi
    extends runtime.BaseAPI
    implements UserReportsApiInterface
{
    /**
     * Create a new user report
     */
    async userReportControllerCreateRaw(
        requestParameters: UserReportControllerCreateRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserReport>> {
        if (requestParameters["createUserReportDTO"] == null) {
            throw new runtime.RequiredError(
                "createUserReportDTO",
                'Required parameter "createUserReportDTO" was null or undefined when calling userReportControllerCreate().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/user-reports`,
                method: "POST",
                headers: headerParameters,
                query: queryParameters,
                body: CreateUserReportDTOToJSON(
                    requestParameters["createUserReportDTO"],
                ),
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserReportFromJSON(jsonValue),
        );
    }

    /**
     * Create a new user report
     */
    async userReportControllerCreate(
        requestParameters: UserReportControllerCreateRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserReport> {
        const response = await this.userReportControllerCreateRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }

    /**
     * Get all user reports
     */
    async userReportControllerFindAllRaw(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<Array<UserReport>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user-reports`,
                method: "GET",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            jsonValue.map(UserReportFromJSON),
        );
    }

    /**
     * Get all user reports
     */
    async userReportControllerFindAll(
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<Array<UserReport>> {
        const response =
            await this.userReportControllerFindAllRaw(initOverrides);
        return await response.value();
    }

    /**
     * Get a user report by id
     */
    async userReportControllerFindOneRaw(
        requestParameters: UserReportControllerFindOneRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<UserReport>> {
        if (requestParameters["id"] == null) {
            throw new runtime.RequiredError(
                "id",
                'Required parameter "id" was null or undefined when calling userReportControllerFindOne().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request(
            {
                path: `/user-reports/{id}`.replace(
                    `{${"id"}}`,
                    encodeURIComponent(String(requestParameters["id"])),
                ),
                method: "GET",
                headers: headerParameters,
                query: queryParameters,
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            UserReportFromJSON(jsonValue),
        );
    }

    /**
     * Get a user report by id
     */
    async userReportControllerFindOne(
        requestParameters: UserReportControllerFindOneRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<UserReport> {
        const response = await this.userReportControllerFindOneRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }
}
