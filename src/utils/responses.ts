/**
 * Base class for all API responses, providing common properties.
 * It establishes a consistent structure for both success and error responses.
 */
class BaseResponse {
    // Indicates whether the API request was successful (true) or not (false).
    public success: boolean;
    // A human-readable message describing the outcome of the request.
    public message: string;

    /**
     * Constructs a new BaseResponse.
     * @param success A boolean indicating success or failure.
     * @param message A descriptive message.
     */
    constructor(success: boolean, message: string) {
        this.success = success;
        this.message = message;
    }
}

/**
 * Represents a successful API response.
 * Extends `BaseResponse` and includes an optional `data` payload.
 * @template T The type of the data payload.
 */
export class SuccessResponse<T> extends BaseResponse {
    // Optional payload containing the requested data or result.
    data?: T;

    /**
     * Constructs a new SuccessResponse.
     * @param data Optional data payload to send with the response.
     * @param message A success message. Defaults to 'Successfully completed the request'.
     */
    constructor(data?: T, message: string = 'Successfully completed the request') {
        super(true, message); // Call BaseResponse constructor with success: true.
        this.data = data;
    }
}

/**
 * Represents an erroneous API response.
 * Extends `BaseResponse` and includes an optional `error` details payload.
 * @template T The type of the error details payload.
 */
export class ErrorResponse<T> extends BaseResponse {
    // Optional payload containing details about the error.
    public error?: T;

    /**
     * Constructs a new ErrorResponse.
     * @param error Optional error details to send with the response.
     * @param message An error message. Defaults to 'Something went wrong'.
     */
    constructor(error?: T, message: string = 'Something went wrong') {
        super(false, message); // Call BaseResponse constructor with success: false.
        this.error = error;
    }
}
