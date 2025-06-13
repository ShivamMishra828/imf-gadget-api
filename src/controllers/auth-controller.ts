import { Request, Response, NextFunction } from 'express';
import UserRepository from '../repositories/user-repository';
import UserService from '../services/auth-service';
import logger from '../config/logger-config';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';

/**
 * Initialize instances of UserRepository and UserService.
 * These are dependencies injected into the controller.
 */
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

/**
 * Handles user sign-up requests.
 * @param req The Express request object, containing user credentials in the body.
 * @param res The Express response object, used to send back the registration status.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Extract email and password from request body.
        const { email, password } = req.body;

        // Call the user service to handle the sign-up logic.
        const user = await userService.signUp({ email, password });

        // Respond with a success status and the registered user data.
        res.status(StatusCodes.CREATED).json(
            new SuccessResponse(user, 'User successfully registered'),
        );
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Auth-Controller: Error during user signup: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}

/**
 * Handles user sign-in requests.
 * @param req The Express request object, containing user credentials in the body.
 * @param res The Express response object, used to send back authentication status and token.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Extract email and password from request body.
        const { email, password } = req.body;

        // Call the user service to handle the sign-in logic and get user and token.
        const { user, token } = await userService.signIn({ email, password });

        /**
         * Set the JWT token as an HTTP-only cookie for enhanced security.
         * Respond with a success status and user/token data.
         */
        res.cookie('token', token, {
            httpOnly: true, // Makes the cookie inaccessible to client-side scripts
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'strict', // Protects against CSRF attacks
            maxAge: 3600000, // Cookie valid for 1 hour
        })
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ user, token }, 'User successfully logged in'));
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Auth-Controller: Error during user sign-in: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}

/**
 * Handles user sign-out requests.
 * @param _req The Express request object.
 * @param res The Express response object, used to clear the authentication token.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function signOut(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Clear the 'token' cookie to log the user out.
        res.clearCookie('token')
            .status(StatusCodes.OK)
            .json(new SuccessResponse(null, 'User successfully logged out.'));
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Auth-Controller: Error during user sign-out: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}
