import { z } from 'zod';

/**
 * @constant userZodSchema
 * @description Defines the validation schema for user-related data (e.g., for signup or login) using Zod.
 * This schema ensures that incoming user data (like email and password) adheres to predefined rules
 * before being processed by the application's logic. It provides strong type validation and clear error messages.
 */
const userZodSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default userZodSchema;
