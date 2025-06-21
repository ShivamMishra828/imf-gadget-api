import GadgetRepository from '../repositories/gadget-repository';
import { Gadget, GadgetStatus } from '@prisma/client';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { generateUniqueNames } from '../utils/helper';

/**
 * @class GadgetService
 * @description Manages all business logic related to `Gadget` entities.
 * This service layer orchestrates interactions between controllers, repositories, and helper functions.
 * It's responsible for enforcing business rules, generating unique attributes, and handling errors specific to gadgets.
 */
class GadgetService {
    // Declare a private instance of GadgetRepository to interact with gadget data.
    private gadgetRepository: GadgetRepository;

    /**
     * @constructor
     * @param {GadgetRepository} gadgetRepository - An instance of GadgetRepository, injected for dependency inversion.
     * This makes the class more testable and flexible by decoupling it from direct repository instantiation.
     */
    constructor(gadgetRepository: GadgetRepository) {
        this.gadgetRepository = gadgetRepository;
    }

    /**
     * @async
     * @method createGadget
     * @description Handles the creation of a new gadget.
     * It generates a unique codename for the gadget and then persists it to the database.
     * @param {string} name - The human-readable name for the new gadget.
     * @returns {Promise<Gadget>} A Promise that resolves to the newly created `Gadget` object.
     * @throws {AppError} If an unexpected error occurs during gadget creation.
     */
    async createGadget(name: string): Promise<Gadget> {
        try {
            // Step 1: Generate a unique codename for the new gadget.
            const codename: string = generateUniqueNames();

            // Step 2: Persist the new gadget to the database using the repository.
            return await this.gadgetRepository.create(name, codename);
        } catch (error) {
            // Catch any errors during the creation process.
            logger.error(
                `[Gadget-Service] Failed to create gadget '${name}'. Unexpected error:`,
                error,
            );

            // Throw a generic server error to the client to avoid exposing internal details.
            throw new AppError(
                'An unexpected error occurred while creating the gadget. Please try again later.',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @async
     * @method getAllGadgets
     * @description Retrieves a list of all gadgets, with an optional filter by status.
     * For each gadget, it calculates and adds a simulated "mission success probability."
     * This method demonstrates fetching data and augmenting it with derived information.
     * @param {GadgetStatus} [status] - Optional. The status to filter gadgets by (e.g., 'Available', 'Decommissioned').
     * @returns {Promise<Gadget[]>} A Promise that resolves to an array of `Gadget` objects,
     * each augmented with a `missionSuccessProbability` string.
     * @throws {AppError} If an unexpected error occurs during fetching.
     */
    async getAllGadgets(status?: GadgetStatus): Promise<Gadget[]> {
        try {
            // Step 1: Fetch gadgets from the repository, optionally filtered by status.
            const gadgets = await this.gadgetRepository.findAll(status);

            // Step 2: Augment each gadget with a simulated 'missionSuccessProbability'.
            return gadgets.map((gadget) => ({
                ...gadget,
                missionSuccessProbability: `${gadget.codename} - ${Math.floor(Math.random() * 101)}% success probability`,
            }));
        } catch (error) {
            // Catch any errors during the fetching process.
            logger.error(
                `[Gadget-Service] Failed to get gadgets list with status "${status || 'any'}". Unexpected error:`,
                error,
            );

            // Throw a generic server error to the client to avoid exposing internal details.
            throw new AppError(
                'An unexpected error occurred during gadget fetching. Please try again later.',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @async
     * @method updateGadget
     * @description Handles updating an existing gadget by its ID.
     * It first verifies the gadget's existence and then checks if the status update is redundant.
     * Finally, it applies the partial updates to the gadget record in the database.
     * @param {string} id - The unique identifier (UUID) of the gadget to update.
     * @param {Partial<Gadget>} updates - An object containing the fields to update (e.g., `name`, `status`).
     * `Partial<Gadget>` ensures that only allowed fields are passed.
     * @returns {Promise<Gadget>} A Promise that resolves to the updated `Gadget` object.
     * @throws {AppError} If the gadget is not found (`StatusCodes.NOT_FOUND`),
     * if the status update is redundant (`StatusCodes.BAD_REQUEST`), or if an unexpected server error occurs.
     */
    async updateGadget(id: string, updates: Partial<Gadget>): Promise<Gadget | null> {
        try {
            // Step 1: Fetch the existing gadget to verify its existence and current state.
            const existingGadget = await this.gadgetRepository.findById(id);

            // Step 2: Check if the gadget exists. If not, throw a NOT_FOUND error.
            if (!existingGadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            // Step 3: If a status update is requested, check if the gadget already has that status.
            if (updates.status && updates.status === existingGadget.status) {
                throw new AppError(
                    `Gadget already has status '${updates.status}'. No update necessary.`,
                    StatusCodes.BAD_REQUEST,
                );
            }

            // Step 4: If all checks pass, proceed to update the gadget in the database.
            return await this.gadgetRepository.update(id, updates);
        } catch (error) {
            if (error instanceof AppError) {
                // If it's an AppError, rethrow it as it's an operational error
                logger.warn(
                    `[Gadget-Service] Operational error updating gadget with ID '${id}': ${error.message}`,
                );
                throw error;
            } else {
                // For any other unexpected errors (e.g., database connection issues, internal server errors):
                logger.error(
                    `Gadget-Service: An unexpected error occurred while updating gadget with ID "${id}":`,
                    error,
                );

                // Throw a generic 500 error to the client to avoid exposing internal details.
                throw new AppError(
                    'An unexpected error occurred while updating the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    /**
     * @async
     * @method decommissionGadget
     * @description Handles the decommissioning of a gadget by its ID.
     * This involves setting its status to 'Decommissioned'. It first verifies
     * the gadget's existence and ensures it's not already decommissioned.
     * @param {string} id - The unique identifier (UUID) of the gadget to decommission.
     * @returns {Promise<Gadget>} A Promise that resolves to the decommissioned `Gadget` object.
     * @throws {AppError} If the gadget is not found (`StatusCodes.NOT_FOUND`),
     * if the gadget is already decommissioned (`StatusCodes.BAD_REQUEST`), or if an unexpected server error occurs.
     */
    async decommissionGadget(id: string): Promise<Gadget | null> {
        try {
            // Step 1: Fetch the existing gadget to verify its existence and current status.
            const gadget = await this.gadgetRepository.findById(id);

            // Step 2: Check if the gadget exists. If not, throw a NOT_FOUND error.
            if (!gadget) {
                throw new AppError(
                    'Gadget not found. Cannot decommission a non-existent gadget.',
                    StatusCodes.NOT_FOUND,
                );
            }

            // Step 3: Check if the gadget is already decommissioned to prevent redundant operations.
            if (gadget.status === 'Decommissioned') {
                throw new AppError(
                    'Gadget is already decommissioned. No update necessary.',
                    StatusCodes.BAD_REQUEST,
                );
            }

            // Step 4: If all checks pass, proceed to decommission the gadget via the repository.
            return await this.gadgetRepository.decommission(id);
        } catch (error) {
            if (error instanceof AppError) {
                // If it's an AppError, rethrow it as it's an operational error
                logger.warn(
                    `[Gadget-Service] Operational error decommissioning gadget with ID '${id}': ${error.message}`,
                );
                throw error;
            } else {
                // For any other unexpected errors (e.g., database issues):
                logger.error(
                    `[Gadget-Service] An unexpected critical error occurred while decommissioning gadget with ID '${id}':`,
                    error,
                );

                // Throw a generic 500 error to the client to avoid exposing internal details.
                throw new AppError(
                    'An unexpected error occurred while decommissioning the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}

export default GadgetService;
