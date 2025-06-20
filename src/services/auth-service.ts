import UserRepository from '../repositories/user-repository';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import { hashPassword } from '../utils/helper';

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

            return userWithoutPassword;
        } catch (error) {
            if (error instanceof AppError) {
                // If it's an AppError, rethrow it as it's an operational error
                logger.warn(
                    `[AuthService] Signup operational error for email "${userData.email}": ${error.message}`,
                );
                throw error;
            } else {
                // For any other unexpected errors (programming errors, database connection issues etc.):
                logger.error(
                    `[AuthService] An unexpected critical error occurred during signup for email "${userData.email}":`,
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
}

export default UserService;
