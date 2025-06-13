import UserRepository from '../repositories/user-repository';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/helper';

/**
 * Type definition for user input (e.g., from request body) for sign-up and sign-in.
 */
type UserInput = {
    email: string;
    password: string;
};

/**
 * Type definition for the output of a successful sign-in operation.
 * It includes the user object (without the password) and the generated JWT token.
 */
type SignInOutput = {
    user: Omit<User, 'password'>;
    token: string;
};

/**
 * Service class for handling user authentication logic (sign-up and sign-in).
 * It interacts with the UserRepository to perform database operations
 * and uses helper functions for security-related tasks like password hashing and token generation.
 */
class UserService {
    private userRepository: UserRepository;

    /**
     * Constructs a new UserService instance.
     * @param userRepository An instance of UserRepository for database interactions.
     */
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Handles the user registration (sign-up) process.
     * @param userData The email and password provided by the user for registration.
     * @returns A promise that resolves to the newly created user object (without password).
     * @throws AppError if the user already exists or an unexpected error occurs.
     */
    async signUp(userData: UserInput): Promise<Omit<User, 'password'>> {
        try {
            // Check if a user with the provided email already exists in the database.
            const existingUser = await this.userRepository.findByEmail(userData.email);

            // If a user exists, throw a CONFLICT error.
            if (existingUser) {
                throw new AppError(
                    'User with the email address already exists. Please use a different email or sign in',
                    StatusCodes.CONFLICT,
                );
            }

            // Hash the plain-text password before storing it in the database for security.
            const hashedPassword: string = await hashPassword(userData.password);

            // Prepare the user data for creation, replacing the plain password with the hashed one.
            const userToCreate = {
                ...userData,
                password: hashedPassword,
            };

            // Create the new user record in the database.
            const user = await this.userRepository.create(userToCreate);

            // Destructure the user object to omit the password field before returning.
            const { password: _, ...userWithoutPassword } = user;

            // Return the user object without sensitive password information.
            return userWithoutPassword;
        } catch (error) {
            // If the error is a known AppError, re-throw it after logging a warning.
            if (error instanceof AppError) {
                logger.warn(
                    `Auth-Service: Signup failed for email "${userData.email}": ${error.message}`,
                );
                throw error;
            } else {
                // For any unexpected errors, log the error and throw a generic server error.
                logger.error(
                    `Auth-Service: An unexpected error occurred during signup for email "${userData.email}":`,
                    error,
                );
                throw new AppError(
                    'An unexpected server error occurred during signup. Please try again later.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    /**
     * Handles the user login (sign-in) process.
     * @param userData The email and password provided by the user for login.
     * @returns A promise that resolves to an object containing the user (without password) and a JWT token.
     * @throws AppError if the user is not found, credentials are invalid, or an unexpected error occurs.
     */
    async signIn(userData: UserInput): Promise<SignInOutput> {
        try {
            // Find the user by their email address in the database.
            const user = await this.userRepository.findByEmail(userData.email);

            // If no user is found with the provided email, throw a NOT_FOUND error.
            if (!user) {
                throw new AppError(
                    'User with this email address does not exists. Please use a different email or sign up',
                    StatusCodes.NOT_FOUND,
                );
            }

            // Compare the provided plain-text password with the stored hashed password.
            const isPasswordValid: boolean = await comparePassword(
                userData.password,
                user.password,
            );

            // If the passwords do not match, throw an UNAUTHORIZED error.
            if (!isPasswordValid) {
                throw new AppError('Invalid Credentials', StatusCodes.UNAUTHORIZED);
            }

            // Generate a JSON Web Token (JWT) for the authenticated user using their ID.
            const token: string = generateToken(user.id);

            // Destructure the user object to omit the password field before returning.
            const { password: _, ...userWithoutPassword } = user;

            // Return the user object (without password) and the generated JWT token.
            return { user: userWithoutPassword, token };
        } catch (error) {
            // If the error is a known AppError, re-throw it after logging a warning.
            if (error instanceof AppError) {
                logger.warn(
                    `Auth-Service: Sign-in failed for email "${userData.email}": ${error.message}`,
                );
                throw error;
            } else {
                // For any unexpected errors, log the error and throw a generic server error.
                logger.error(
                    `Auth-Service: An unexpected error occurred during sign-in for email "${userData.email}":`,
                    error,
                );
                throw new AppError(
                    'An unexpected server error occurred during sign-in. Please try again later.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}

export default UserService;
