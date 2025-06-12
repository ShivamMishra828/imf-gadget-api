import { z } from 'zod';

const userZodSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z.string().min(8, 'Password is required'),
});

export default userZodSchema;
