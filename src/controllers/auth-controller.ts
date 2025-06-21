import { Request, Response, NextFunction } from 'express';
import UserRepository from '../repositories/user-repository';
import UserService from '../services/auth-service';
import logger from '../config/logger-config';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';

// Instantiate the UserRepository. This will interact directly with the database.
const userRepository = new UserRepository();

// Instantiate the UserService, injecting the userRepository.
const userService = new UserService(userRepository);

/**
 * @async
 * @function signUp
 * @description Handles the user signup API request.
 * This controller function receives signup data, delegates the business logic to the `UserService`,
 * and sends an appropriate HTTP response back to the client.
 * It acts as an entry point for the signup process, orchestrating the flow.
 *
 * @param {Request} req - The Express request object, containing the request body (email, password).
 * @param {Response} res - The Express response object, used to send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Destructure email and password from the request body.
        const { email, password } = req.body;

        // Delegate the signup business logic to the UserService.
        const user = await userService.signUp({ email, password });

        // If signup is successful, send a 201 Created status code with a success response.
        res.status(StatusCodes.CREATED).json(
            new SuccessResponse(user, 'User successfully registered'),
        );
    } catch (error) {
        // If an error occurs during the signup process (e.g., email already exists, unexpected server error),
        logger.error(
            `[Auth-Controller] Error during user signup for email '${req.body.email}':`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}

/**
 * @async
 * @function signIn
 * @description Handles the user sign-in (login) API request.
 * This controller function receives login credentials, delegates authentication to the `UserService`,
 * sets a JWT in an HTTP-only cookie, and sends an appropriate HTTP response.
 *
 * @param {Request} req - The Express request object, containing the request body (email, password).
 * @param {Response} res - The Express response object, used to send the API response and set cookies.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Destructure email and password from the request body.
        const { email, password } = req.body;

        // Delegate the sign-in business logic to the UserService.
        const { user, token } = await userService.signIn({ email, password });

        // Set the JWT in an HTTP-only cookie.
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        })
            // Send a 200 OK status code with a success response.
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ user, token }, 'User successfully logged in'));
    } catch (error) {
        // If an error occurs during the sign-in process (e.g., invalid credentials, unexpected server error),
        logger.error(
            `[Auth-Controller] Error during user sign-in for email '${req.body.email}':`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}

/**
 * @async
 * @function signOut
 * @description Handles the user sign-out (logout) API request.
 * This controller function clears the authentication token from the client's cookies,
 * effectively logging the user out. It doesn't require any business logic delegation
 * as it only manipulates the client's cookie.
 *
 * @param {Request} _req - The Express request object (prefixed with `_` as it's not used).
 * @param {Response} res - The Express response object, used to clear cookies and send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function signOut(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Clear the 'token' cookie from the client's browser.
        res.clearCookie('token')
            // Send a 200 OK status code with a success response.
            .status(StatusCodes.OK)
            .json(new SuccessResponse(null, 'User successfully logged out.'));
    } catch (error) {
        // If an unexpected error occurs during the cookie clearing process,
        logger.error(`[Auth-Controller] Error during user sign-out:`, error);

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}
