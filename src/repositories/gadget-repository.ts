import prisma from '../config/prisma-client';
import { Prisma, Gadget, GadgetStatus } from '@prisma/client';

/**
 * @class GadgetRepository
 * @description Manages all database operations related to the `Gadget` model.
 * This repository serves as a dedicated layer for interacting with the 'gadgets' table.
 * It encapsulates common database queries, making the service layer cleaner,
 * and simplifying data access logic by abstracting away direct Prisma client calls.
 */
class GadgetRepository {
    /**
     * @method create
     * @description Creates a new gadget record in the database.
     * When a new gadget is added, this method handles its persistence.
     * @param {string} name - The human-readable name of the gadget.
     * @param {string} codename - The unique internal codename of the gadget.
     * @returns {Promise<Gadget>} A Promise that resolves to the newly created `Gadget` object.
     */
    create(name: string, codename: string): Promise<Gadget> {
        return prisma.gadget.create({
            data: {
                name,
                codename,
            },
        });
    }

    /**
     * @method findAll
     * @description Retrieves all gadget records from the database, optionally filtered by status.
     * This is useful for listing all gadgets or finding gadgets in a specific state.
     * @param {GadgetStatus} [status] - Optional. If provided, filters gadgets by this specific status.
     * @returns {Promise<Gadget[]>} A Promise that resolves to an array of `Gadget` objects.
     */
    findAll(status?: GadgetStatus): Promise<Gadget[]> {
        return prisma.gadget.findMany({
            where: status ? { status } : {},
        });
    }

    /**
     * @method findById
     * @description Retrieves a single gadget record by its unique ID.
     * This is commonly used when we need to fetch specific gadget details.
     * @param {string} id - The unique ID of the gadget to find.
     * @returns {Promise<Gadget | null>} A Promise that resolves to the `Gadget` object if found, otherwise `null`.
     */
    findById(id: string): Promise<Gadget | null> {
        return prisma.gadget.findUnique({
            where: { id },
        });
    }

    /**
     * @method update
     * @description Updates an existing gadget record by its ID.
     * This allows modification of various gadget properties.
     * @param {string} id - The unique ID of the gadget to update.
     * @param {Prisma.GadgetUpdateInput} updateData - An object containing the data to update.
     * `Prisma.GadgetUpdateInput` ensures type safety for the update payload.
     * @returns {Promise<Gadget | null>} A Promise that resolves to the updated `Gadget` object if found and updated, otherwise `null`.
     */
    update(id: string, updateData: Prisma.GadgetUpdateInput): Promise<Gadget | null> {
        return prisma.gadget.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * @method decommission
     * @description Changes a gadget's status to `Decommissioned` and records the decommissioning time.
     * This marks a gadget as retired from active service.
     * @param {string} id - The unique ID of the gadget to decommission.
     * @returns {Promise<Gadget | null>} A Promise that resolves to the updated `Gadget` object, or `null` if not found.
     */
    decommission(id: string): Promise<Gadget | null> {
        return prisma.gadget.update({
            where: { id },
            data: {
                status: GadgetStatus.Decommissioned,
                decommissionedAt: new Date(),
            },
        });
    }

    /**
     * @method selfDestruct
     * @description Changes a gadget's status to `Destroyed`.
     * This indicates the gadget has been permanently destroyed.
     * @param {string} id - The unique ID of the gadget to mark as destroyed.
     * @returns {Promise<Gadget | null>} A Promise that resolves to the updated `Gadget` object, or `null` if not found.
     */
    selfDestruct(id: string): Promise<Gadget | null> {
        return prisma.gadget.update({
            where: { id },
            data: {
                status: GadgetStatus.Destroyed,
            },
        });
    }
}

export default GadgetRepository;
