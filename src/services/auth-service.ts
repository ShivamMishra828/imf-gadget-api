import UserRepository from '../repositories/user-repository';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import { comparePassword, generateToken, hashPassword } from '../utils/helper';

type UserInput = {
    email: string;
    password: string;
};

type SignInOutput = {
    user: Omit<User, 'password'>;
    token: string;
};

class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async signUp(userData: UserInput): Promise<Omit<User, 'password'>> {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);

            if (existingUser) {
                throw new AppError(
                    'User with the email address already exists. Please use a different email or sign in',
                    StatusCodes.CONFLICT,
                );
            }

            const hashedPassword: string = await hashPassword(userData.password);

            const userToCreate = {
                ...userData,
                password: hashedPassword,
            };

            const user = await this.userRepository.create(userToCreate);

            const { password: _, ...userWithoutPassword } = user;

            return userWithoutPassword;
        } catch (error) {
            if (error instanceof AppError) {
                logger.warn(`Signup failed for email "${userData.email}": ${error.message}`);
                throw error;
            } else {
                logger.error(
                    `An unexpected error occurred during signup for email "${userData.email}":`,
                    error,
                );
                throw new AppError(
                    'An unexpected server error occurred during signup. Please try again later.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async signIn(userData: UserInput): Promise<SignInOutput> {
        try {
            const user = await this.userRepository.findByEmail(userData.email);

            if (!user) {
                throw new AppError(
                    'User with this email address does not exists, please use a different email or sign up',
                    StatusCodes.NOT_FOUND,
                );
            }

            const isPasswordCorrect: boolean = await comparePassword(
                userData.password,
                user.password,
            );

            if (!isPasswordCorrect) {
                throw new AppError('Invalid Credentials', StatusCodes.UNAUTHORIZED);
            }

            const token: string = generateToken(user.id);
            const { password: _, ...userWithoutPassword } = user;

            return {
                user: userWithoutPassword,
                token,
            };
        } catch (error) {
            if (error instanceof AppError) {
                logger.warn(`Sign-in failed for email "${userData.email}": ${error.message}`);
                throw error;
            } else {
                logger.error(
                    `An unexpected error occurred during sign-in for email "${userData.email}":`,
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
