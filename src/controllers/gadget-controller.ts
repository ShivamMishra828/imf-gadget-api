import { Request, Response, NextFunction } from 'express';
import GadgetRepository from '../repositories/gadget-repository';
import GadgetService from '../services/gadget-service';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';
import logger from '../config/logger-config';
import { GadgetStatus } from '@prisma/client';

/**
 * Initialize instances of GadgetRepository and GadgetService.
 * These are dependencies injected into the controller.
 */
const gadgetRepository = new GadgetRepository();
const gadgetService = new GadgetService(gadgetRepository);

/**
 * Handles creating a new gadget.
 * @param req The Express request object, containing gadget name in the body.
 * @param res The Express response object, used to send back the creation status.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function createGadget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Call the service layer to create the gadget with the provided name.
        const gadget = await gadgetService.createGadget(req.body.name);

        // Respond with a 201 Created status and the newly created gadget data.
        res.status(StatusCodes.CREATED).json(
            new SuccessResponse(gadget, 'Gadget created successfully'),
        );
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Gadget-Controller: Failed to create gadget: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}

/**
 * Handles fetching all gadgets.
 * @param req The Express request object, optionally containing 'status' query parameter.
 * @param res The Express response object, used to send back the list of gadgets.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function getAllGadgets(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Extract optional status query parameter to filter gadgets.
        const status = req.query?.status as GadgetStatus | undefined;

        // Call the service layer to retrieve all gadgets, optionally filtered by status.
        const gadgets = await gadgetService.getAllGadgets(status);

        // Respond with a 200 OK status and the list of fetched gadgets.
        res.status(StatusCodes.OK).json(
            new SuccessResponse(gadgets, 'Fetched gadgets list successfully'),
        );
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Gadget-Controller: Failed to fetch gadgets: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}

/**
 * Handles updating an existing gadget.
 * @param req The Express request object, containing gadget ID in params and update data in body.
 * @param res The Express response object, used to send back the updated gadget.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function updateGadget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Call the service layer to update the gadget using ID from params and data from body.
        const gadget = await gadgetService.updateGadget(req.params.id, req.body);

        // Respond with a 200 OK status and the updated gadget data.
        res.status(StatusCodes.OK).json(new SuccessResponse(gadget, 'Gadget updated successfully'));
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Gadget-Controller: Failed to update gadget: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}

/**
 * Handles decommissioning a gadget.
 * @param req The Express request object, containing gadget ID in params.
 * @param res The Express response object, used to send back the decommissioned gadget.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function decommissionGadget(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Call the service layer to decommission the gadget using the ID from params.
        const gadget = await gadgetService.decommissionGadget(req.params.id);

        // Respond with a 200 OK status and the decommissioned gadget data.
        res.status(StatusCodes.OK).json(
            new SuccessResponse(gadget, 'Gadget decommission successfully'),
        );
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Gadget-Controller: Failed to decommission gadget: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}

/**
 * Handles triggering self-destruction for a gadget.
 * @param req The Express request object, containing gadget ID in params.
 * @param res The Express response object, used to send back the destruction result.
 * @param next The Express next middleware function, used for error forwarding.
 */
export async function selfDestructGadget(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Call the service layer to trigger self-destruction for the gadget using the ID from params.
        const result = await gadgetService.triggerSelfDestruct(req.params.id);

        // Respond with a 200 OK status and the result of the destruction.
        res.status(StatusCodes.OK).json(
            new SuccessResponse(result, 'Gadget destructed successfully'),
        );
    } catch (error) {
        // Log the error for internal monitoring and debugging.
        logger.error(`Gadget-Controller: Failed to self destruct gadget: ${error}`);

        // Pass the error to the next middleware (error handling middleware).
        next(error);
    }
}
