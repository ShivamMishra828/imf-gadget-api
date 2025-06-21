import { Request, Response, NextFunction } from 'express';
import GadgetRepository from '../repositories/gadget-repository';
import GadgetService from '../services/gadget-service';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';
import logger from '../config/logger-config';
import { GadgetStatus } from '@prisma/client';

// Instantiate the GadgetRepository. This will interact directly with the database for gadget operations.
const gadgetRepository = new GadgetRepository();

// Instantiate the GadgetService, injecting the gadgetRepository.
const gadgetService = new GadgetService(gadgetRepository);

/**
 * @async
 * @function createGadget
 * @description Handles the API request for creating a new gadget.
 * This controller receives the gadget's name from the request body,
 * delegates the creation logic to the `GadgetService`, and sends an appropriate HTTP response back to the client.
 *
 * @param {Request} req - The Express request object, containing the request body (e.g., `name`).
 * @param {Response} res - The Express response object, used to send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function createGadget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Extract the 'name' from the request body.
        const { name } = req.body;

        // Delegate the gadget creation business logic to the GadgetService.
        const gadget = await gadgetService.createGadget(name);

        // If gadget creation is successful, send a 201 Created status code with a success response.
        res.status(StatusCodes.CREATED).json(
            new SuccessResponse(gadget, 'Gadget created successfully.'), // Adjusted message for more clarity
        );
    } catch (error) {
        // If an error occurs during the gadget creation process, log the error and pass it to the global error handler.
        logger.error(
            `[Gadget-Controller] Failed to create gadget for name '${req.body.name}':`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}

/**
 * @async
 * @function getAllGadgets
 * @description Handles the API request for retrieving a list of all gadgets.
 * It can optionally filter gadgets by their `status` provided as a query parameter.
 * Delegates the fetching and data augmentation logic to the `GadgetService` and sends an appropriate HTTP response.
 *
 * @param {Request} req - The Express request object, containing optional query parameters (e.g., `status`).
 * @param {Response} res - The Express response object, used to send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function getAllGadgets(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Extract the optional 'status' query parameter.
        const status = req.query?.status as GadgetStatus | undefined;

        // Delegate the gadget fetching business logic to the GadgetService.
        const gadgets = await gadgetService.getAllGadgets(status);

        // If fetching is successful, send a 200 OK status code with a success response.
        res.status(StatusCodes.OK).json(
            new SuccessResponse(gadgets, 'Fetched gadgets list successfully'),
        );
    } catch (error) {
        // If an error occurs during the gadget fetching process,
        logger.error(
            `[Gadget-Controller] Failed to fetch gadgets (status: ${req.query?.status || 'any'}):`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}

/**
 * @async
 * @function updateGadget
 * @description Handles the API request for updating an existing gadget.
 * It extracts the gadget ID from URL parameters and update fields from the request body.
 * Delegates the update logic to the `GadgetService` and sends an appropriate HTTP response.
 *
 * @param {Request} req - The Express request object, containing URL parameters (`id`) and request body (`updates`).
 * @param {Response} res - The Express response object, used to send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function updateGadget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Extract the gadget ID from URL parameters.
        const { id } = req.params;

        // Extract the update fields from the request body.
        const updates = req.body;

        // Delegate the gadget update business logic to the GadgetService.logger.info(`[Gadget-Controller] Update gadget request received for ID: '${id}'. Updates: ${JSON.stringify(updates)}`);
        const gadget = await gadgetService.updateGadget(id, updates);

        // If the gadget is successfully updated, send a 200 OK status code with a success response.
        res.status(StatusCodes.OK).json(new SuccessResponse(gadget, 'Gadget updated successfully'));
    } catch (error) {
        // If an error occurs during the gadget update process (e.g., gadget not found, validation error, unexpected error),
        logger.error(
            `[Gadget-Controller] Failed to update gadget with ID '${req.params.id}':`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}

/**
 * @async
 * @function decommissionGadget
 * @description Handles the API request to decommission a gadget by its ID.
 * This effectively marks the gadget as 'Decommissioned' in the system.
 * It extracts the gadget ID from URL parameters, delegates the logic
 * to the `GadgetService`, and sends an appropriate HTTP response.
 *
 * @param {Request} req - The Express request object, containing URL parameters (`id`).
 * @param {Response} res - The Express response object, used to send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function decommissionGadget(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Extract the gadget ID from URL parameters.
        const { id } = req.params;

        // Delegate the gadget decommissioning business logic to the GadgetService.
        const gadget = await gadgetService.decommissionGadget(id);

        // If the gadget is successfully decommissioned, send a 200 OK status code with a success response.
        res.status(StatusCodes.OK).json(
            new SuccessResponse(gadget, 'Gadget decommissioned successfully.'),
        );
    } catch (error) {
        // If an error occurs during the gadget decommissioning process,
        logger.error(
            `[Gadget-Controller] Failed to decommission gadget with ID '${req.params.id}':`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}

/**
 * @async
 * @function selfDestructGadget
 * @description Handles the API request to initiate a self-destruct sequence for a gadget by its ID.
 * This operation changes the gadget's status to 'Destroyed' and returns a confirmation code.
 * It extracts the gadget ID from URL parameters and delegates the logic to `GadgetService`.
 *
 * @param {Request} req - The Express request object, containing URL parameters (`id`).
 * @param {Response} res - The Express response object, used to send the API response.
 * @param {NextFunction} next - The Express next middleware function, used to pass errors to the global error handler.
 * @returns {Promise<void>} A Promise that resolves when the response is sent or error is passed.
 */
export async function selfDestructGadget(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Extract the gadget ID from URL parameters.
        const { id } = req.params;

        // Delegate the self-destruct business logic to the GadgetService.
        const result = await gadgetService.triggerSelfDestruct(id);

        // If self-destruct is successful, send a 200 OK status code with a success response.
        res.status(StatusCodes.OK).json(
            new SuccessResponse(result, 'Gadget self-destruct sequence initiated successfully.'),
        );
    } catch (error) {
        // If an error occurs during the self-destruct process,
        logger.error(
            `[Gadget-Controller] Failed to self-destruct gadget with ID '${req.params.id}':`,
            error,
        );

        // Pass the error to the next error-handling middleware.
        next(error);
    }
}
