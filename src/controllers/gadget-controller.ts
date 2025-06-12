import { Request, Response, NextFunction } from 'express';
import GadgetRepository from '../repositories/gadget-repository';
import GadgetService from '../services/gadget-service';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/responses';
import logger from '../config/logger-config';

const gadgetRepository = new GadgetRepository();
const gadgetService = new GadgetService(gadgetRepository);

export async function createGadget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const gadget = await gadgetService.createGadget(req.body.name);

        res.status(StatusCodes.CREATED).json(
            new SuccessResponse(gadget, 'Gadget created successfully'),
        );
    } catch (error) {
        logger.error(`Failed to create gadget: ${error}`);
        next(error);
    }
}
