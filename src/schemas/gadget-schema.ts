import { z } from 'zod';
import { GadgetStatus } from '@prisma/client';

/**
 * @constant gadgetStatusEnum
 * @description Creates a Zod enum schema directly from the `GadgetStatus` enum defined in Prisma.
 * This ensures that validation for gadget status is always in sync with your database schema,
 * preventing invalid status values from being accepted.
 * `Object.values(GadgetStatus)` retrieves all string values of the enum.
 * `as [string, ...string[]]` is a type assertion needed by Zod's `enum` function.
 */
const gadgetStatusEnum = z.enum(Object.values(GadgetStatus) as [string, ...string[]]);

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

/**
 * @constant getAllGadgetsSchema
 * @description Defines the validation schema for fetching all gadgets, specifically for query parameters.
 * This schema allows for an optional `status` query parameter to filter the results.
 * It uses the `gadgetStatusEnum` to ensure that if `status` is provided, it's a valid `GadgetStatus` value.
 */
export const getAllGadgetsSchema = z.object({
    status: gadgetStatusEnum.optional(),
});
