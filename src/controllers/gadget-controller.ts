import { Request, Response, NextFunction } from 'express';
import GadgetRepository from '../repositories/gadget-repository';
import GadgetService from '../services/gadget-service';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';
import logger from '../config/logger-config';

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
