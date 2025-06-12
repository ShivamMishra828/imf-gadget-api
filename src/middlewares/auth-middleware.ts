import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger-config';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

async function verifyJwtToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const token: string = req.cookies?.token;

    if (!token) {
        logger.warn('No JWT Token found in cookies');
        return next(new AppError('No token provided. Please log in', StatusCodes.UNAUTHORIZED));
    }

    try {
        const decoded = jwt.verify(token, ServerConfig.JWT_SECRET) as { id: string };

        if (!decoded) {
            logger.error('JWT decoded payload missing ID or ID is not a string', { decoded });
            return next(new AppError('Invalid JWT Token structure', StatusCodes.UNAUTHORIZED));
        }

        req.userId = decoded.id;
        next();
    } catch (error: any) {
        logger.error('JWT verification failed', {
            errorName: error.name,
            errorMessage: error.message,
        });

        if (error.name === 'JsonWebTokenError') {
            return next(
                new AppError('Invalid JWT Token. Please log in again.', StatusCodes.UNAUTHORIZED),
            );
        } else if (error.name === 'TokenExpiredError') {
            return next(
                new AppError('Token expired. Please log in again', StatusCodes.UNAUTHORIZED),
            );
        } else {
            return next(
                new AppError(
                    'Authentication Failed unexpectedly',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                ),
            );
        }
    }
}

export default verifyJwtToken;
