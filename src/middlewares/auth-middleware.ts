import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger-config';
import jwt from 'jsonwebtoken';
import ServerConfig from '../config/server-config';

/**
 * @global
 * @namespace Express
 * @interface Request
 * @description Extends the Express `Request` interface to add an optional `userId` property.
 * This allows authenticated user ID to be attached directly to the request object,
 * making it accessible to subsequent middleware and route handlers without needing to re-decode the token.
 */
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

/**
 * @async
 * @function verifyJwtToken
 * @description Middleware to verify the authenticity and validity of a JSON Web Token (JWT).
 * This middleware expects the JWT to be present in an HTTP-only cookie named 'token'.
 * It decodes the token, verifies its signature and expiration, and if valid,
 * attaches the authenticated user's ID to the `req.userId` property for downstream use.
 * If the token is missing or invalid, it throws an `AppError` to be caught by the global error handler.
 *
 * @param {Request} req - The Express request object, which may contain cookies.
 * @param {Response} _res - The Express response object (unused).
 * @param {NextFunction} next - The Express next middleware function, used to pass control or errors.
 * @returns {Promise<void>} A Promise that resolves when control is passed to the next middleware or an error is thrown.
 */
async function verifyJwtToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
    // Attempt to extract the JWT from the 'token' cookie.
    const token: string = req.cookies?.token;

    // Step 1: Check if a token exists in the cookies.
    if (!token) {
        logger.warn('[Auth-Middleware] Authentication failed: No JWT Token found in cookies.');
        return next(new AppError('No token provided. Please log in', StatusCodes.UNAUTHORIZED));
    }

    try {
        // Step 2: Verify the JWT using the secret key.
        const decoded = jwt.verify(token, ServerConfig.JWT_SECRET) as { id: string };

        // Step 3: Ensure the decoded token contains the expected user ID.
        if (!decoded || !decoded.id) {
            logger.error(
                '[Auth-Middleware] JWT verification failed: Decoded payload missing user ID.',
            );
            return next(new AppError('Invalid JWT Token structure', StatusCodes.UNAUTHORIZED));
        }

        // Step 4: Attach the extracted user ID to the request object.
        req.userId = decoded.id;

        // Step 5: Pass control to the next middleware or route handler.
        next();
    } catch (error: any) {
        logger.error('[Auth-Middleware] JWT verification failed for token.', {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack,
        });

        // Handle specific JWT-related errors.
        if (error.name === 'JsonWebTokenError') {
            // This error occurs if the token's signature is invalid, or it's malformed.
            return next(
                new AppError('Authentication failed. Invalid token.', StatusCodes.UNAUTHORIZED),
            );
        } else if (error.name === 'TokenExpiredError') {
            // This error occurs if the token has expired.
            return next(
                new AppError('Authentication failed. Token has expired.', StatusCodes.UNAUTHORIZED),
            );
        } else {
            // Catch any other unexpected errors during the verification process.
            return next(
                new AppError(
                    'Authentication failed due to an unexpected server error.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                ),
            );
        }
    }
}

export default verifyJwtToken;
