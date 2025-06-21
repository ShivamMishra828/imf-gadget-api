import { z } from 'zod';

/**
 * @constant createGadgetSchema
 * @description Defines the validation schema for creating a new gadget using Zod.
 * This schema ensures that the incoming data for creating a gadget adheres to predefined rules,
 * particularly for the `name` field, before being processed by the application.
 */
export const createGadgetSchema = z.object({
    name: z
        .string()
        .min(1, 'Gadget name is required')
        .max(255, 'Gadget name cannot exceed 255 characters'),
});
