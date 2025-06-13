import prisma from '../config/prisma-client';
import { Prisma, Gadget, GadgetStatus } from '@prisma/client';

/**
 * Manages database operations for Gadget entities using Prisma.
 * This repository abstracts direct Prisma client calls, providing a clean API for services.
 */
class GadgetRepository {
    /**
     * Creates a new gadget in the database.
     * @param name The name of the gadget.
     * @param codename The unique codename of the gadget.
     * @returns The newly created Gadget object.
     */
    async create(name: string, codename: string): Promise<Gadget> {
        return await prisma.gadget.create({
            data: {
                name,
                codename,
            },
        });
    }

    /**
     * Retrieves all gadgets from the database.
     * Optionally filters gadgets by their status.
     * @param status An optional GadgetStatus to filter by.
     * @returns An array of Gadget objects.
     */
    async findAll(status?: GadgetStatus): Promise<Gadget[]> {
        return await prisma.gadget.findMany({
            where: status ? { status } : {},
        });
    }

    /**
     * Finds a single gadget by its unique ID.
     * @param id The ID of the gadget to find.
     * @returns The Gadget object if found, otherwise null.
     */
    async findById(id: string): Promise<Gadget | null> {
        return await prisma.gadget.findUnique({
            where: { id },
        });
    }

    /**
     * Updates an existing gadget by its ID with the provided data.
     * @param id The ID of the gadget to update.
     * @param updateData The data to update the gadget with (e.g., name, status).
     * @returns The updated Gadget object if found, otherwise null.
     */
    async update(id: string, updateData: Prisma.GadgetUpdateInput): Promise<Gadget | null> {
        return await prisma.gadget.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Decommissions a gadget by setting its status to 'Decommissioned' and recording the time.
     * @param id The ID of the gadget to decommission.
     * @returns The decommissioned Gadget object if found, otherwise null.
     */
    async decommission(id: string): Promise<Gadget | null> {
        return await prisma.gadget.update({
            where: { id },
            data: {
                status: GadgetStatus.Decommissioned,
                decommissionedAt: new Date(),
            },
        });
    }

    /**
     * "Self-destructs" a gadget by setting its status to 'Destroyed'.
     * @param id The ID of the gadget to self-destruct.
     * @returns The destroyed Gadget object if found, otherwise null.
     */
    async selfDestruct(id: string): Promise<Gadget | null> {
        return await prisma.gadget.update({
            where: { id },
            data: {
                status: GadgetStatus.Destroyed,
            },
        });
    }
}

export default GadgetRepository;
