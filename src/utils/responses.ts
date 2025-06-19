/**
 * @class BaseResponse
 * @description Represents the foundational structure for all API responses.
 * This class ensures that every response, whether successful or an error,
 * consistently includes `success` (boolean) and `message` (string) properties.
 * This consistency is crucial for clients consuming the API to easily determine
 * the outcome of an operation.
 */
class BaseResponse {
    // Indicates whether the operation was successful (true) or failed (false).
    public success: boolean;

    // A descriptive message for the response.
    public message: string;

    /**
     * @constructor
     * @param {boolean} success - True if the operation was successful, false otherwise.
     * @param {string} message - A descriptive message for the response.
     */
    constructor(success: boolean, message: string) {
        this.success = success;
        this.message = message;
    }
}

/**
 * @class SuccessResponse
 * @extends BaseResponse
 * @description Represents a successful API response.
 * This class extends `BaseResponse` and adds an optional `data` property
 * to carry the actual payload.
 * It defaults the `success` property to `true` and provides a default success message.
 * @template T - The type of the data payload.
 */
export class SuccessResponse<T> extends BaseResponse {
    // Optional property to hold the actual response data.
    data?: T;

    /**
     * @constructor
     * @param {T} [data] - The data payload to be sent with the successful response. Optional.
     * @param {string} [message] - A custom success message. Defaults to 'Operation successful.'.
     */
    constructor(data?: T, message: string = 'Operation successful') {
        super(true, message);
        this.data = data;
    }
}

/**
 * @class ErrorResponse
 * @extends BaseResponse
 * @description Represents an erroneous API response.
 * This class extends `BaseResponse` and adds an optional `error` property
 * which can hold details about the error (e.g., validation errors, error codes).
 * It defaults the `success` property to `false` and provides a default error message.
 * @template T - The type of the error details payload.
 */
export class ErrorResponse<T> extends BaseResponse {
    // Optional property to hold specific error details.
    public error?: T;

    /**
     * @constructor
     * @param {T} [error] - The error details payload to be sent with the response. Optional.
     * @param {string} [message] - A custom error message. Defaults to 'An unexpected error occurred.'.
     */
    constructor(error?: T, message: string = 'Operation failed') {
        super(false, message);
        this.error = error;
    }
}
