import prisma from '../config/prisma-client';
import { Prisma, User } from '@prisma/client';

/**
 * @class UserRepository
 * @description Manages all database operations related to the `User` model.
 * This repository acts as an abstraction layer between the application's business logic
 * and the raw Prisma Client, promoting a clean architecture. It centralizes database queries
 * for users, making them reusable and easier to maintain.
 */
class UserRepository {
    /**
     * @method findByEmail
     * @description Retrieves a single user record from the database by their email address.
     * This method is crucial for operations like user login or checking for existing user registrations.
     * @param {string} email - The email address of the user to find.
     * @returns {Promise<User | null>} A Promise that resolves to the `User` object if found, otherwise `null`.
     */
    findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    /**
     * @method create
     * @description Creates a new user record in the database.
     * This method is used during user registration.
     * @param {Prisma.UserCreateInput} userData - An object containing the data for the new user.
     * `Prisma.UserCreateInput` ensures type safety and includes
     * all required fields for user creation according to your schema.
     * @returns {Promise<User>} A Promise that resolves to the newly created `User` object.
     */
    create(userData: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data: userData,
        });
    }
}

export default UserRepository;
