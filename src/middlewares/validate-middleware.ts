import { AnyZodObject, ZodError, ZodIssue } from 'zod';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger-config';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/app-error';

const validate =
    (schema: AnyZodObject) =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: ZodIssue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                logger.warn(`Zod validation failed for request: ${JSON.stringify(errorMessages)}`);
                next(new AppError('Validation Failed', StatusCodes.BAD_REQUEST, errorMessages));
            } else {
                logger.error(`An unexpected error occurred during validation: ${error}`);

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
