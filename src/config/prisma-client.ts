import { PrismaClient } from '@prisma/client';

/**
 * Initializes a new instance of PrismaClient.
 * This client is used to interact with the database through Prisma's ORM.
 * It's configured to connect to the database specified in your `schema.prisma` file
 * and `DATABASE_URL` environment variable.
 */
const prisma = new PrismaClient();

export default prisma;
