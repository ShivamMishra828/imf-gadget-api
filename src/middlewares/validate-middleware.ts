import { AnyZodObject, ZodError, ZodIssue } from 'zod';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger-config';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/app-error';

/**
 * @type {'body' | 'params' | 'query'} ValidationTarget
 * @description Defines the possible locations within an Express request to validate against a Zod schema.
 * This allows the middleware to validate data coming from the request body, URL parameters, or query strings.
 */
type ValidationTarget = 'body' | 'params' | 'query';

/**
 * @function validate
 * @description Higher-order function that creates an Express middleware for input validation using Zod.
 * This middleware dynamically validates incoming request data (`req.body`, `req.params`, or `req.query`)
 * against a provided Zod schema. If validation fails, it catches the `ZodError`,
 * formats the error messages, logs them, and passes an `AppError` to the global error handler.
 *
 * @param {AnyZodObject} schema - The Zod schema to validate the request data against.
 * @param {ValidationTarget} [target='body'] - The part of the request object to validate ('body', 'params', or 'query').
 * Defaults to 'body'.
 * @returns {Function} An asynchronous Express middleware function.
 */
const validate =
    (schema: AnyZodObject, target: ValidationTarget = 'body'): Function =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            // Attempt to parse and validate the specified part of the request (e.g., req.body) against the schema.
            await schema.parseAsync(req[target]);

            // If validation is successful, pass control to the next middleware or route handler.
            next();
        } catch (error) {
            // Check if the caught error is specifically a Zod validation error.
            if (error instanceof ZodError) {
                // Map Zod's detailed error issues into a more concise and client-friendly format.
                const errorMessages = error.errors.map((issue: ZodIssue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                // Log the validation failure for debugging purposes.
                logger.warn(
                    `[Validation-Middleware] Input validation failed for ${target}: ${JSON.stringify(errorMessages)}`,
                );

                // Pass an `AppError` to the global error handler.
                next(new AppError('Validation Failed', StatusCodes.BAD_REQUEST, errorMessages));
            } else {
                // Log this critical error for internal debugging.
                logger.error(
                    `[Validation-Middleware] An unexpected internal error occurred during validation for ${target}:`,
                );

                // Pass a generic `AppError` with a 500 Internal Server Error status code.
                next(
                    new AppError(
                        'An unexpected server error occurred during validation. Please try again later.',
                        StatusCodes.INTERNAL_SERVER_ERROR,
                    ),
                );
            }
        }
    };

export default validate;
