import UserRepository from '../repositories/user-repository';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/helper';

/**
 * @interface UserInput
 * @property {string} email - The user's email address.
 * @property {string} password - The user's plain text password.
 * @description Defines the expected structure for user input data, especially for signup.
 */
interface UserInput {
    email: string;
    password: string;
}

/**
 * @interface SignInOutput
 * @property {Omit<User, 'password'>} user - The authenticated user object, with the password omitted for security.
 * @property {string} token - The generated JWT for the authenticated user.
 * @description Defines the structure of the data returned after a successful user sign-in.
 */
interface SignInOutput {
    user: Omit<User, 'password'>;
    token: string;
}

/**
 * @class AuthService
 * @description Manages all business logic related to user authentication (e.g., signup, login).
 * This service layer orchestrates interactions between controllers, repositories, and helper functions.
 */
class UserService {
    // Declare a private instance of UserRepository to interact with user data.
    private userRepository: UserRepository;

    /**
     * @constructor
     * @param {UserRepository} userRepository - An instance of UserRepository, injected for dependency inversion.
     * This makes the class more testable and flexible.
     */
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * @async
     * @method signUp
     * @description Handles the user registration process.
     * It checks for existing users, hashes passwords, and creates a new user record.
     * @param {UserInput} userData - An object containing the new user's email and password.
     * @returns {Promise<Omit<User, 'password'>>} A Promise that resolves to the newly created User object,
     * with the password field omitted for security.
     * @throws {AppError} If a user with the provided email already exists or if an unexpected error occurs.
     */
    async signUp(userData: UserInput): Promise<Omit<User, 'password'>> {
        try {
            // Step 1: Check if a user with the given email already exists in the database.
            const existingUser = await this.userRepository.findByEmail(userData.email);

            // If a user with this email exists, throw an operational error.
            if (existingUser) {
                throw new AppError(
                    `User with the email address '${userData.email}' already exists. Please use a different email or sign in.`,
                    StatusCodes.CONFLICT,
                );
            }

            // Step 2: Hash the plain text password before storing it.
            const hashedPassword: string = await hashPassword(userData.password);

            // Step 3: Prepare the user data for creation, including the hashed password.
            const userToCreate = {
                email: userData.email,
                password: hashedPassword,
            };

            // Step 4: Create the new user record in the database using the repository.
            const user = await this.userRepository.create(userToCreate);

            // Step 5: Omit the password from the returned user object for security.
            const { password: _, ...userWithoutPassword } = user;

            // Step 6: Return the user object (without password).
            return userWithoutPassword;
        } catch (error) {
            if (error instanceof AppError) {
                // If it's an AppError, rethrow it as it's an operational error
                logger.warn(
                    `[Auth-Service] Signup operational error for email "${userData.email}": ${error.message}`,
                );
                throw error;
            } else {
                // For any other unexpected errors (programming errors, database connection issues etc.):
                logger.error(
                    `[Auth-Service] An unexpected critical error occurred during signup for email "${userData.email}":`,
                    error,
                );

                // Throw a generic 500 error to the client to avoid exposing internal details.
                throw new AppError(
                    'An unexpected server error occurred during signup. Please try again later.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    /**
     * @async
     * @method signIn
     * @description Authenticates a user based on their email and password.
     * If credentials are valid, it generates an authentication token.
     * @param {UserInput} userData - An object containing the user's email and plain text password for login.
     * @returns {Promise<SignInOutput>} A Promise that resolves to an object containing the authenticated user (without password) and a JWT.
     * @throws {AppError} If the user is not found, credentials are invalid, or an unexpected error occurs.
     */
    async signIn(userData: UserInput): Promise<SignInOutput> {
        try {
            // Step 1: Find the user by their email address.
            const user = await this.userRepository.findByEmail(userData.email);

            // If no user is found with the provided email, throw an authentication error.
            if (!user) {
                throw new AppError(
                    `User with the email address ${userData.email} does not exists. Please use a different email or sign up`,
                    StatusCodes.NOT_FOUND,
                );
            }

            // Step 2: Compare the provided plain text password with the stored hashed password.
            const isPasswordValid: boolean = await comparePassword(
                userData.password,
                user.password,
            );

            // If the passwords do not match, throw an authentication error.
            if (!isPasswordValid) {
                throw new AppError(
                    'Invalid credentials. Please check your email and password',
                    StatusCodes.UNAUTHORIZED,
                );
            }

            // Step 3: Generate a JSON Web Token (JWT) for the authenticated user.
            const token: string = generateToken(user.id);

            // Step 4: Omit the password from the user object before returning it for security.
            const { password: _, ...userWithoutPassword } = user;

            // Step 5: Return the user object (without password) and the generated token.
            return { user: userWithoutPassword, token };
        } catch (error) {
            if (error instanceof AppError) {
                // If it's an AppError (operational error), rethrow it.
                logger.warn(
                    `[Auth-Service] Sign-in operational error for email "${userData.email}": ${error.message}`,
                );
                throw error;
            } else {
                // For any other unexpected errors (e.g., database issues, external service failures):
                logger.error(
                    `[Auth-Service] An unexpected critical error occurred during sign-in for email "${userData.email}":`,
                    error,
                );

                // Throw a generic 500 error to the client to avoid exposing internal details.
                throw new AppError(
                    'An unexpected server error occurred during sign-in. Please try again later.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}

export default UserService;
