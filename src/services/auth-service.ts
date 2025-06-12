import UserRepository from '../repositories/user-repository';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import { hashPassword } from '../utils/helper';

type UserInput = {
    email: string;
    password: string;
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
}

export default UserService;
