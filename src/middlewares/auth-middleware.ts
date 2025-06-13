import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger-config';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';

/**
 * Extends the Express Request interface to include an optional `userId` property.
 * This allows storing the authenticated user's ID on the request object for downstream use.
 */
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

/**
 * Middleware to verify a JWT token from incoming request cookies.
 * It extracts the token, verifies it against the secret, and attaches the
 * decoded user ID to the request object if successful.
 *
 * @param req The Express request object, expecting a 'token' cookie.
 * @param _res The Express response object (unused in this middleware).
 * @param next The Express next middleware function, used for forwarding or error handling.
 * @returns void
 */
async function verifyJwtToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
    // Attempt to extract the JWT token from the request cookies.
    const token: string = req.cookies?.token;

    // If no token is found, log a warning and return an UNAUTHORIZED error.
    if (!token) {
        logger.warn('Auth-Middleware: No JWT Token found in cookies.');
        return next(new AppError('No token provided. Please log in', StatusCodes.UNAUTHORIZED));
    }

    try {
        /**
         * Verify the token using the configured JWT secret.
         * The decoded payload is asserted to have an 'id' property.
         */
        const decoded = jwt.verify(token, ServerConfig.JWT_SECRET) as { id: string };

        // Check if the decoded payload is valid and contains an 'id'.
        if (!decoded) {
            logger.error('Auth-Middleware: JWT decoded payload missing ID.');
            return next(new AppError('Invalid JWT Token structure', StatusCodes.UNAUTHORIZED));
        }

        // Attach the authenticated user's ID to the request object for subsequent handlers.
        req.userId = decoded.id;

        // Proceed to the next middleware or route handler.
        next();
    } catch (error: any) {
        // Log the general JWT verification failure with error details.
        logger.error('Auth-Middleware: JWT verification failed.', {
            errorName: error.name,
            errorMessage: error.message,
        });

        // Handle specific JWT errors to provide more precise feedback to the client.
        if (error.name === 'JsonWebTokenError') {
            // General JWT error (e.g., malformed token, invalid signature).
            return next(
                new AppError('Invalid JWT Token. Please log in again.', StatusCodes.UNAUTHORIZED),
            );
        } else if (error.name === 'TokenExpiredError') {
            // Token has expired.
            return next(
                new AppError('Token expired. Please log in again.', StatusCodes.UNAUTHORIZED),
            );
        } else {
            // Catch-all for any other unexpected authentication errors.
            return next(
                new AppError(
                    'Authentication failed unexpectedly.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                ),
            );
        }
    }
}

export default verifyJwtToken;
