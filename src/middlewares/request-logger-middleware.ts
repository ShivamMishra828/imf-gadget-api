import logger from '../config/logger-config';
import { NextFunction, Request, Response } from 'express';

/**
 * @function requestLogger
 * @description Express middleware to log incoming requests and their corresponding responses.
 * This middleware provides valuable insights into API traffic, including request method, URL,
 * response status code, and the time taken to process the request.
 * It helps in debugging, monitoring, and understanding application performance.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The callback function to pass control to the next middleware.
 */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
    // Destructure HTTP method and URL from the request object.
    const { method, url } = req;

    // Record the timestamp when the request started processing.
    const startTime: number = Date.now();

    // Log the incoming request with its method and URL.
    logger.info(`[HTTP Request] Incoming: ${method} ${url}`);

    // Attach an event listener to the 'finish' event of the response object.
    res.on('finish', (): void => {
        // Get the HTTP status code from the response.
        const { statusCode } = res;

        // Calculate the total time taken to process the request.
        const duration: number = Date.now() - startTime;

        /**
         * Construct a descriptive message based on the response status code.
         * If statusCode is 400 or above (client or server error), it's marked as FAILED.
         * Otherwise, it's marked as SUCCESS.
         */
        const message: string =
            statusCode >= 400
                ? `[HTTP Response] ${method} ${url} - Status: ${statusCode} - FAILED (${duration}ms)`
                : `[HTTP Response] ${method} ${url} - Status: ${statusCode} - SUCCESS (${duration}ms)`;

        // Log the response message.
        (statusCode >= 400 ? logger.error : logger.info)(message);
    });

    // Pass control to the next middleware in the chain.
    next();
}

export default requestLogger;
