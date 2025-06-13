import logger from '../config/logger-config';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to log incoming HTTP requests and their corresponding responses.
 * It logs the request method and URL upon arrival, and then logs the response
 * status code and duration upon completion.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The Express next middleware function.
 */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
    // Destructure method and URL from the request object.
    const { method, url } = req;

    // Record the start time of the request for calculating duration.
    const startTime: number = Date.now();

    // Log the incoming request with its method and URL.
    logger.info(`Incoming Request: ${method} ${url}`);

    /**
     * Attach a 'finish' event listener to the response object.
     * This callback fires when the response has been sent to the client.
     */
    res.on('finish', (): void => {
        // Destructure the status code from the response.
        const { statusCode } = res;

        // Calculate the duration of the request-response cycle.
        const duration: number = Date.now() - startTime;

        /**
         * Construct the log message based on the response status code.
         * If status code is 400 or above, it indicates a failure; otherwise, it's a success.
         */
        const message: string =
            statusCode >= 400
                ? `Response: ${method} ${url} - ${statusCode} - FAILED (${duration}ms)`
                : `Response: ${method} ${url} - ${statusCode} - SUCCESS (${duration}ms)`;

        // Log the message. Use logger.error for failures (status code >= 400), and logger.info for successes.
        (statusCode >= 400 ? logger.error : logger.info)(message);
    });

    // Pass control to the next middleware in the chain.
    next();
}

export default requestLogger;
