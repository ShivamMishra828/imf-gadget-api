import { z } from 'zod';
import { GadgetStatus } from '@prisma/client';

/**
 * Create a Zod enum from the Prisma GadgetStatus enum values.
 * This allows Zod to validate against the defined statuses (e.g., 'Active', 'Decommissioned', 'Destroyed').
 */
const gadgetStatusEnum = z.enum(Object.values(GadgetStatus) as [string, ...string[]]);

/**
 * Zod schema for validating the data required to create a new gadget.
 */
export const createGadgetSchema = z.object({
    /**
     * `name`: The name of the gadget.
     * - Must be a string.
     * - Minimum length of 1 character (required).
     * - Maximum length of 255 characters.
     */
    name: z
        .string()
        .min(1, 'Gadget name is required')
        .max(255, 'Gadget name cannot exceed 255 characters'),
});

/**
 * Zod schema for validating query parameters when fetching all gadgets.
 */
export const getAllGadgetsSchema = z.object({
    /**
     * `status`: Optional filter for gadget status.
     * - Must be one of the values defined in `GadgetStatus` enum.
     * - Optional, meaning gadgets will not be filtered by status if not provided.
     */
    status: gadgetStatusEnum.optional(),
});

/**
 * Zod schema for validating data when updating a gadget.
 * This schema combines validation for the gadget's ID (from params) and potential update fields (from body).
 */
export const updateGadgetSchema = z.object({
    /**
     * `name`: Optional new name for the gadget.
     * - Must be a string.
     * - Maximum length of 255 characters.
     * - Optional, meaning the name does not have to be updated.
     */
    name: z.string().max(255, 'Name is too long.').optional(),
    /**
     * `id`: The unique identifier of the gadget to update.
     * - Must be a string.
     * - Must be a valid UUID format.
     */
    id: z.string().uuid('Invalid gadget ID format.'),
    /**
     * `status`: Optional new status for the gadget.
     * - Must be one of the values defined in `GadgetStatus` enum.
     * - Optional, meaning the status does not have to be updated.
     */
    status: gadgetStatusEnum.optional(),
});

/**
 * Zod schema specifically for validating a gadget ID provided as a URL parameter.
 * Used for routes that operate on a single gadget identified by its ID (e.g., delete, self-destruct).
 */
export const idParamSchema = z.object({
    /**
     * `id`: The unique identifier of the gadget.
     * - Must be a string.
     * - Must be a valid UUID format.
     */
    id: z.string().uuid('Invalid gadget ID format.'),
});
