import prisma from '../config/prisma-client';
import { Prisma, User } from '@prisma/client';

/**
 * Manages database operations for User entities using Prisma.
 * This repository provides methods for common user-related database interactions.
 */
class UserRepository {
    /**
     * Finds a single user by their email address.
     * @param email The email of the user to find.
     * @returns The User object if found, otherwise null.
     */
    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({ where: { email } });
    }

    /**
     * Creates a new user in the database.
     * @param userData The data for the new user, conforming to Prisma's UserCreateInput type.
     * @returns The newly created User object.
     */
    async create(userData: Prisma.UserCreateInput): Promise<User> {
        return await prisma.user.create({
            data: userData,
        });
    }
}

export default UserRepository;
