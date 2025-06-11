import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { ErrorResponse } from '../utils/responses';
import { StatusCodes } from 'http-status-codes';

function globalErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    logger.error(`Global Error: ${err.message}`, { stack: err.stack });

    if (err instanceof AppError) {
        res.status(err.statusCode).json(new ErrorResponse(err, err.message));
        return;
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ErrorResponse(err, 'Internal Server Error'),
        );
    }
}

export default globalErrorHandler;
