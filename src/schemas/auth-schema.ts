import { z } from 'zod';

/**
 * Zod schema for user authentication (signup/signin) data.
 * This schema defines the validation rules for the `email` and `password` fields.
 */
const userZodSchema = z.object({
    /**
     * `email`:
     * - Must be a string.
     * - Must be a valid email format (`.email()`).
     * - Cannot be empty (`.min(1)`).
     */
    email: z.string().email('Invalid email address').min(1, 'Email is required'),

    /**
     * `password`:
     * - Must be a string.
     * - Must be at least 8 characters long (`.min(8)`).
     */
    password: z.string().min(8, 'Password must be at least 8 characters long'), // Improved error message
});

export default userZodSchema;
