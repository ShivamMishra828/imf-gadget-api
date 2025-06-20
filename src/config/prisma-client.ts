import { PrismaClient } from '@prisma/client';

/**
 * @constant prisma
 * @description Initializes and exports a single instance of PrismaClient.
 * This client is the primary interface for interacting with database.
 * By creating a single instance and exporting it, we ensure that
 * throughout your application, you use the same database connection pool,
 * which is a best practice for performance and resource management.
 */
const prisma = new PrismaClient();

export default prisma;
