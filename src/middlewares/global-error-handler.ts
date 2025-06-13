import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { ErrorResponse } from '../utils/responses';
import { StatusCodes } from 'http-status-codes';

/**
 * Global error handling middleware for Express applications.
 * This middleware catches all errors forwarded from other routes/middlewares,
 * logs them, and sends an appropriate error response to the client.
 *
 * @param err The error object caught by Express.
 * @param _req The Express request object (unused).
 * @param res The Express response object, used to send the error response.
 * @param _next The Express next middleware function (unused, as this is the final error handler).
 */
function globalErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    // Log the error details, including the stack trace, for debugging and monitoring.
    logger.error(`Global Error Handler: ${err.message}`, { stack: err.stack });

    // Check if the error is an instance of `AppError` (custom application error).
    if (err instanceof AppError) {
        // If it's a custom `AppError`, respond with its specific status code and message.
        res.status(err.statusCode).json(new ErrorResponse(err, err.message));
        return; // End the response cycle.
    } else {
        /**
         * For any other unexpected errors (e.g., system errors, third-party library errors),
         * respond with a generic 500 Internal Server Error to avoid exposing sensitive details.
         */
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ErrorResponse(err, 'Internal Server Error'),
        );
    }
}

export default globalErrorHandler;
