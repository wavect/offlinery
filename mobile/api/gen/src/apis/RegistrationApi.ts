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
  RegistrationForVerificationDto,
  VerifyEmailDto,
} from '../models/index';
import {
    RegistrationForVerificationDtoFromJSON,
    RegistrationForVerificationDtoToJSON,
    VerifyEmailDtoFromJSON,
    VerifyEmailDtoToJSON,
} from '../models/index';

// We import this type even if it's unused to avoid additional
// template rendering logic. If the drawbacks of this approach
// are larger than the benefits, we can try another approach.
import { ImagePickerAsset } from "expo-image-picker";
export interface RegistrationControllerRegisterUserForEmailVerificationRequest {
    registrationForVerificationDto: RegistrationForVerificationDto;
}

export interface RegistrationControllerVerifyEmailRequest {
    verifyEmailDto: VerifyEmailDto;
}

/**
 * RegistrationApi - interface
 * 
 * @export
 * @interface RegistrationApiInterface
 */
export interface RegistrationApiInterface {
    /**
     * 
     * @summary Creates a user with only an email to verify.
     * @param {RegistrationForVerificationDto} registrationForVerificationDto User email.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RegistrationApiInterface
     */
    registrationControllerRegisterUserForEmailVerificationRaw(requestParameters: RegistrationControllerRegisterUserForEmailVerificationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistrationForVerificationDto>>;

    /**
     * Creates a user with only an email to verify.
     */
    registrationControllerRegisterUserForEmailVerification(requestParameters: RegistrationControllerRegisterUserForEmailVerificationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistrationForVerificationDto>;

    /**
     * 
     * @summary Verify email with verification code.
     * @param {VerifyEmailDto} verifyEmailDto User email and verification code.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RegistrationApiInterface
     */
    registrationControllerVerifyEmailRaw(requestParameters: RegistrationControllerVerifyEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Verify email with verification code.
     */
    registrationControllerVerifyEmail(requestParameters: RegistrationControllerVerifyEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

}

/**
 * 
 */
export class RegistrationApi extends runtime.BaseAPI implements RegistrationApiInterface {

    /**
     * Creates a user with only an email to verify.
     */
    async registrationControllerRegisterUserForEmailVerificationRaw(requestParameters: RegistrationControllerRegisterUserForEmailVerificationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistrationForVerificationDto>> {
        if (requestParameters['registrationForVerificationDto'] == null) {
            throw new runtime.RequiredError(
                'registrationForVerificationDto',
                'Required parameter "registrationForVerificationDto" was null or undefined when calling registrationControllerRegisterUserForEmailVerification().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/registration`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: RegistrationForVerificationDtoToJSON(requestParameters['registrationForVerificationDto']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistrationForVerificationDtoFromJSON(jsonValue));
    }

    /**
     * Creates a user with only an email to verify.
     */
    async registrationControllerRegisterUserForEmailVerification(requestParameters: RegistrationControllerRegisterUserForEmailVerificationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistrationForVerificationDto> {
        const response = await this.registrationControllerRegisterUserForEmailVerificationRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Verify email with verification code.
     */
    async registrationControllerVerifyEmailRaw(requestParameters: RegistrationControllerVerifyEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['verifyEmailDto'] == null) {
            throw new runtime.RequiredError(
                'verifyEmailDto',
                'Required parameter "verifyEmailDto" was null or undefined when calling registrationControllerVerifyEmail().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/registration/verify-email`,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: VerifyEmailDtoToJSON(requestParameters['verifyEmailDto']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Verify email with verification code.
     */
    async registrationControllerVerifyEmail(requestParameters: RegistrationControllerVerifyEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.registrationControllerVerifyEmailRaw(requestParameters, initOverrides);
    }

}
