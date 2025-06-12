import { z } from 'zod';
import { GadgetStatus } from '@prisma/client';

const gadgetStatusEnum = z.enum(Object.values(GadgetStatus) as [string, ...string[]]);

export const createGadgetSchema = z.object({
    name: z
        .string()
        .min(1, 'Gadget name is required')
        .max(255, 'Gadget name cannot exceed 255 characters'),
});

export const getAllGadgetsSchema = z.object({
    status: gadgetStatusEnum.optional(),
});
