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
}

export default GadgetService;
