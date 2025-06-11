import prisma from '../config/prisma-client';
import { Prisma, User } from '@prisma/client';

class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({ where: { email } });
    }

    async create(userData: Prisma.UserCreateInput): Promise<User> {
        return await prisma.user.create({
            data: userData,
        });
    }
}

export default UserRepository;
