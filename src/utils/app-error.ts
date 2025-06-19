/**
 * @class AppError
 * @extends Error
 * @description Custom error class for handling application-specific errors.
 * This class extends the native JavaScript `Error` object, allowing us to
 * add custom properties like `statusCode`, `isOperational`, and `details`.
 * It's designed to differentiate between operational errors (expected, like validation failures)
 * and programming errors (unexpected, like bugs), which is crucial for
 * robust error handling in production environments.
 */
class AppError extends Error {
    // The HTTP status code associated with the error.
    public readonly statusCode: number;

    // Indicates if the error is operational (true) or a programming error (false).
    public readonly isOperational: boolean;

    // Optional extra details about the error.
    public readonly details?: any;

    /**
     * @constructor
     * @param {string} message - A human-readable error message. This is often what's shown to the client.
     * @param {number} [statusCode=500] - The HTTP status code for the error. Defaults to 500 (Internal Server Error).
     * @param {any} [details] - Optional additional error details.
     * @param {boolean} [isOperational=true] - Flag to mark the error as operational. Defaults to true.
     */
    constructor(
        message: string,
        statusCode: number = 500,
        details?: any,
        isOperational: boolean = true,
    ) {
        // Call the parent `Error` class constructor with the error message.
        super(message);

        // Correctly set the prototype chain for custom errors.
        Object.setPrototypeOf(this, new.target.prototype);

        // Set the name of the error to the class name (e.g., 'AppError').
        this.name = this.constructor.name;

        // Assign the provided status code.
        this.statusCode = statusCode;

        // Assign the operational flag.
        this.isOperational = isOperational;

        // Assign any optional details.
        this.details = details;

        // Capture the stack trace. This is crucial for debugging as it shows where the error was thrown.
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export default AppError;
