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

import type { SignInDTO, SignInResponseDTO } from "../models/index";
import { SignInDTOToJSON, SignInResponseDTOFromJSON } from "../models/index";
import * as runtime from "../runtime";

// We import this type even if it's unused to avoid additional
// template rendering logic. If the drawbacks of this approach
// are larger than the benefits, we can try another approach.
export interface AuthControllerSignInRequest {
    signInDTO: SignInDTO;
}

/**
 * AuthApi - interface
 *
 * @export
 * @interface AuthApiInterface
 */
export interface AuthApiInterface {
    /**
     *
     * @param {SignInDTO} signInDTO
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthApiInterface
     */
    authControllerSignInRaw(
        requestParameters: AuthControllerSignInRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<SignInResponseDTO>>;

    /**
     */
    authControllerSignIn(
        requestParameters: AuthControllerSignInRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<SignInResponseDTO>;
}

/**
 *
 */
export class AuthApi extends runtime.BaseAPI implements AuthApiInterface {
    /**
     */
    async authControllerSignInRaw(
        requestParameters: AuthControllerSignInRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<runtime.ApiResponse<SignInResponseDTO>> {
        if (requestParameters["signInDTO"] == null) {
            throw new runtime.RequiredError(
                "signInDTO",
                'Required parameter "signInDTO" was null or undefined when calling authControllerSignIn().',
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters["Content-Type"] = "application/json";

        const response = await this.request(
            {
                path: `/auth/login`,
                method: "POST",
                headers: headerParameters,
                query: queryParameters,
                body: SignInDTOToJSON(requestParameters["signInDTO"]),
            },
            initOverrides,
        );

        return new runtime.JSONApiResponse(response, (jsonValue) =>
            SignInResponseDTOFromJSON(jsonValue),
        );
    }

    /**
     */
    async authControllerSignIn(
        requestParameters: AuthControllerSignInRequest,
        initOverrides?: RequestInit | runtime.InitOverrideFunction,
    ): Promise<SignInResponseDTO> {
        const response = await this.authControllerSignInRaw(
            requestParameters,
            initOverrides,
        );
        return await response.value();
    }
}
