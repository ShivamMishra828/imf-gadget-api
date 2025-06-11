import logger from '../config/logger-config';
import { NextFunction, Request, Response } from 'express';

function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const { method, url } = req;
    const startTime: number = Date.now();

    logger.info(`Incoming Request: ${method} ${url}`);

    res.on('finish', (): void => {
        const { statusCode } = res;
        const duration: number = Date.now() - startTime;

        const message: string =
            statusCode >= 400
                ? `Response: ${method} ${url} - ${statusCode} - FAILED (${duration}ms)`
                : `Response: ${method} ${url} - ${statusCode} - SUCCESS (${duration}ms)`;

        (statusCode >= 400 ? logger.error : logger.info)(message);
    });

    next();
}

export default requestLogger;
