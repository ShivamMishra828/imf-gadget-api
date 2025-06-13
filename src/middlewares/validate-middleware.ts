import { AnyZodObject, ZodError, ZodIssue } from 'zod';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger-config';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/app-error';

/**
 * Middleware factory for input validation using Zod schemas.
 * It dynamically validates `req.body`, `req.params`, or `req.query` against a given Zod schema.
 *
 * @param schema The Zod schema to validate against.
 * @param target The part of the request object to validate ('body', 'params', or 'query'). Defaults to 'body'.
 * @returns An Express middleware function.
 */
const validate =
    (schema: AnyZodObject, target: 'body' | 'params' | 'query' = 'body') =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            /**
             * Attempt to parse and validate the specified request target (body, params, or query)
             * against the provided Zod schema. This will throw a ZodError if validation fails.
             */
            await schema.parseAsync(req[target]);

            // If validation is successful, proceed to the next middleware or route handler.
            next();
        } catch (error) {
            // Check if the caught error is a Zod validation error.
            if (error instanceof ZodError) {
                // Map Zod issues into a more client-friendly format, showing field and message.
                const errorMessages = error.errors.map((issue: ZodIssue) => ({
                    field: issue.path.join('.'), // Joins path parts (e.g., ['user', 'email'] -> 'user.email')
                    message: issue.message,
                }));

                // Log a warning for validation failures, including the specific error messages.
                logger.warn(
                    `Validate-Middleware: Zod validation failed for request: ${JSON.stringify(errorMessages)}`,
                );

                // Forward a custom AppError with a 400 Bad Request status and detailed validation errors.
                next(new AppError('Validation Failed', StatusCodes.BAD_REQUEST, errorMessages));
            } else {
                // Log any unexpected errors that are not ZodErrors.
                logger.error(
                    `Validate-Middleware: An unexpected error occurred during validation: ${error}`,
                );

                // Forward a generic 500 Internal Server Error for unexpected validation failures.
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
