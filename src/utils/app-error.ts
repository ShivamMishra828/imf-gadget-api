/**
 * Custom error class for handling operational errors in the application.
 * Extends the native `Error` class to add specific properties like `statusCode`,
 * `isOperational`, and optional `details`. This helps in distinguishing
 * between expected, handled errors (operational) and unexpected programming errors.
 */
class AppError extends Error {
    // HTTP status code associated with the error (e.g., 404, 500).
    public readonly statusCode: number;

    // Indicates if the error is an expected, operational error (true) or an unexpected programming error (false).
    public readonly isOperational: boolean;

    // Optional additional details about the error, useful for debugging.
    public readonly details?: any;

    /**
     * Creates an instance of AppError.
     * @param message A human-readable error message.
     * @param statusCode The HTTP status code to be sent with the error response. Defaults to 500 (Internal Server Error).
     * @param details Optional, additional context or data related to the error.
     * @param isOperational Optional, boolean indicating if the error is operational. Defaults to true.
     */
    constructor(
        message: string,
        statusCode: number = 500,
        details?: any,
        isOperational: boolean = true,
    ) {
        // Call the parent Error class constructor with the error message.
        super(message);

        // This line is crucial for proper inheritance in TypeScript/Babel. It ensures that `instanceof AppError` works correctly
        Object.setPrototypeOf(this, new.target.prototype);

        // Set the name of the error to the class name (e.g., 'AppError').
        this.name = this.constructor.name;

        // Assign the provided status code.
        this.statusCode = statusCode;

        // Assign the operational status.
        this.isOperational = isOperational;

        // Assign any additional details.
        this.details = details;

        // Capture the stack trace. This helps in debugging by showing where the error was thrown.
        // `Error.captureStackTrace` is V8-specific (Node.js) and improves stack trace readability.
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export default AppError;
