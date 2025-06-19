import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { ErrorResponse } from '../utils/responses';
import { StatusCodes } from 'http-status-codes';

/**
 * @function globalErrorHandler
 * @description Centralized error handling middleware for the Express application.
 * This is the last middleware in the chain specifically designed to catch and process any errors that occur during the request-response cycle.
 * It ensures that all errors are properly logged and a consistent,
 * user-friendly error response is sent back to the client, preventing
 * sensitive internal error details from being exposed in production.
 *
 * @param {Error} err - The error object caught by Express's error handling mechanism.
 * @param {Request} _req - The Express request object.
 * @param {Response} res - The Express response object, used to send the error response to the client.
 * @param {NextFunction} _next - The Express next middleware function.
 */
function globalErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    // Log the error details, including the stack trace, for internal debugging and monitoring.
    logger.error(`[Global Error] Encountered an error: ${err.message}`, { stack: err.stack });

    // Check if the caught error is an instance of our custom `AppError`.
    if (err instanceof AppError) {
        res.status(err.statusCode).json(new ErrorResponse(err, err.message));
        return;
    } else {
        // For any other unexpected errors (e.g., native Node.js errors, bugs, third-party library issues),
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ErrorResponse(
                err,
                'An unexpected internal server error occurred. Please try again later.',
            ),
        );
    }
}

export default globalErrorHandler;
