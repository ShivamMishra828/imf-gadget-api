import { z } from 'zod';

/**
 * @constant userZodSchema
 * @description Defines the validation schema for user-related data (e.g., for signup or login) using Zod.
 * This schema ensures that incoming user data (like email and password) adheres to predefined rules
 * before being processed by the application's logic. It provides strong type validation and clear error messages.
 */
const userZodSchema = z.object({
    /**
     * @property {ZodString} email - Defines validation rules for the 'email' field.
     * `z.string()`: Ensures the email is a string.
     * `.email('Invalid email address')`: Validates that the string is a valid email format.
     * `.min(1, 'Email is required')`: Ensures the email string is not empty.
     */
    email: z.string().email('Invalid email address').min(1, 'Email is required'),

    /**
     * @property {ZodString} password - Defines validation rules for the 'password' field.
     * `z.string()`: Ensures the password is a string.
     * `.min(8, 'Password must be at least 8 characters long')`: Enforces a minimum length for the password,
     * enhancing basic security.
     */
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default userZodSchema;
