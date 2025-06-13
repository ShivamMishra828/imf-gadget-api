import GadgetRepository from '../repositories/gadget-repository';
import { Gadget, GadgetStatus } from '@prisma/client';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { generateConfirmationCode, generateUniqueNames } from '../utils/helper';

/**
 * Service class for handling all business logic related to Gadget entities.
 * It orchestrates operations between the controller and the repository,
 * applying validation, business rules, and error handling.
 */
class GadgetService {
    private gadgetRepository: GadgetRepository;

    /**
     * Constructs a new GadgetService instance.
     * @param gadgetRepository An instance of GadgetRepository for database interactions.
     */
    constructor(gadgetRepository: GadgetRepository) {
        this.gadgetRepository = gadgetRepository;
    }

    /**
     * Creates a new gadget.
     * @param name The name of the gadget.
     * @returns A promise that resolves to the newly created Gadget object.
     * @throws AppError if an unexpected error occurs during creation.
     */
    async createGadget(name: string): Promise<Gadget> {
        try {
            // Generate a unique codename for the new gadget.
            const codename: string = generateUniqueNames();

            // Call the repository to create the gadget with the provided name and generated codename.
            return await this.gadgetRepository.create(name, codename);
        } catch (error) {
            // Log the error for internal monitoring.
            logger.error('Gadget-Service: Failed to create Gadget', error);

            // Throw a generic internal server error for unexpected issues.
            throw new AppError(
                'An unexpected error occurred while creating the gadget.',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Retrieves all gadgets, optionally filtered by status.
     * @param status An optional GadgetStatus to filter the results.
     * @returns A promise that resolves to an array of Gadget objects,
     * each enhanced with a mission success probability.
     * @throws AppError if an unexpected error occurs during fetching.
     */
    async getAllGadgets(status?: GadgetStatus): Promise<Gadget[]> {
        try {
            // Fetch all gadgets from the repository, applying an optional status filter.
            const gadgets = await this.gadgetRepository.findAll(status);

            // Map over the retrieved gadgets to add a fictional mission success probability.
            return gadgets.map((gadget) => ({
                ...gadget,
                missionSuccessProbability: `${gadget.codename} - ${Math.floor(Math.random() * 101)}% success probability`,
            }));
        } catch (error) {
            // Log the error for internal monitoring.
            logger.error(
                `Gadget-Service: Failed to get gadgets list with status "${status || 'any'}":`,
                error,
            );

            // Throw a generic internal server error for unexpected issues.
            throw new AppError(
                'An unexpected error occurred during gadget fetching.',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Updates an existing gadget.
     * @param id The ID of the gadget to update.
     * @param updates The partial data to apply as updates to the gadget.
     * @returns A promise that resolves to the updated Gadget object, or null if not found.
     * @throws AppError if the gadget is not found or an unexpected error occurs.
     */
    async updateGadget(id: string, updates: Partial<Gadget>): Promise<Gadget | null> {
        try {
            // Call the repository to update the gadget by its ID.
            const updatedGadget = await this.gadgetRepository.update(id, updates);

            // If no gadget was found with the given ID, throw a NOT_FOUND error.
            if (!updatedGadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            // Return the updated gadget.
            return updatedGadget;
        } catch (error) {
            // If it's a known AppError, re-throw after logging a warning.
            if (error instanceof AppError) {
                logger.warn(
                    `Gadget-Service: Error updating gadget with ID "${id}": ${error.message}`,
                );
                throw error;
            } else {
                // For unexpected errors, log and throw a generic server error.
                logger.error(
                    `Gadget-Service: An unexpected error occurred while updating gadget with ID "${id}":`,
                    error,
                );
                throw new AppError(
                    'An unexpected error occurred while updating the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    /**
     * Decommissions a gadget by updating its status and decommissioned timestamp.
     * @param id The ID of the gadget to decommission.
     * @returns A promise that resolves to the decommissioned Gadget object, or null if not found.
     * @throws AppError if the gadget is not found, already decommissioned, or an unexpected error occurs.
     */
    async decommissionGadget(id: string): Promise<Gadget | null> {
        try {
            // Find the gadget by its ID to check its current status.
            const gadget = await this.gadgetRepository.findById(id);

            // If no gadget was found, throw a NOT_FOUND error.
            if (!gadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            // If the gadget is already decommissioned, throw a BAD_REQUEST error.
            if (gadget.status === 'Decommissioned') {
                throw new AppError('Gadget is already decommissioned', StatusCodes.BAD_REQUEST);
            }

            // Call the repository to update the gadget's status to 'Decommissioned'.
            return await this.gadgetRepository.decommission(id);
        } catch (error) {
            // If it's a known AppError, re-throw after logging a warning.
            if (error instanceof AppError) {
                logger.warn(
                    `Gadget-Service: Error decommissioning gadget with ID "${id}": ${error.message}`,
                );
                throw error;
            } else {
                // For unexpected errors, log and throw a generic server error.
                logger.error(
                    `Gadget-Service: An unexpected error occurred while decommissioning gadget with ID "${id}":`,
                    error,
                );
                throw new AppError(
                    'An unexpected error occurred while decommissioning the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    /**
     * Triggers the self-destruction sequence for a gadget.
     * @param id The ID of the gadget to self-destruct.
     * @returns A promise that resolves to the destroyed Gadget object along with a confirmation code.
     * @throws AppError if the gadget is not found, already destroyed, or an unexpected error occurs.
     */
    async triggerSelfDestruct(id: string) {
        try {
            // Find the gadget by its ID to check its current status.
            const gadget = await this.gadgetRepository.findById(id);

            // If no gadget was found, throw a NOT_FOUND error.
            if (!gadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            // If the gadget is already destroyed, throw a BAD_REQUEST error.
            if (gadget.status === 'Destroyed') {
                throw new AppError('Gadget is already destroyed', StatusCodes.BAD_REQUEST);
            }

            // Generate a confirmation code for the self-destruction.
            const confirmationCode: string = generateConfirmationCode();

            // Call the repository to update the gadget's status to 'Destroyed'.
            const destroyedGadget = await this.gadgetRepository.selfDestruct(id);

            // Return the destroyed gadget details along with the generated confirmation code.
            return {
                ...destroyedGadget,
                confirmationCode,
            };
        } catch (error) {
            // If it's a known AppError, re-throw after logging a warning.
            if (error instanceof AppError) {
                logger.warn(
                    `Gadget-Service: Error self destructing gadget with ID "${id}": ${error.message}`,
                );
                throw error;
            } else {
                // For unexpected errors, log and throw a generic server error.
                logger.error(
                    `Gadget-Service: An unexpected error occurred while self destructing gadget with ID "${id}":`,
                    error,
                );
                throw new AppError(
                    'An unexpected error occurred while self destructing the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}

export default GadgetService;
