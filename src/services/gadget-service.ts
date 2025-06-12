import GadgetRepository from '../repositories/gadget-repository';
import { Gadget } from '@prisma/client';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { generateUniqueNames } from '../utils/helper';

class GadgetService {
    private gadgetRepository: GadgetRepository;

    constructor(gadgetRepository: GadgetRepository) {
        this.gadgetRepository = gadgetRepository;
    }

    async createGadget(name: string): Promise<Gadget> {
        try {
            const codename: string = generateUniqueNames();

            return await this.gadgetRepository.create(name, codename);
        } catch (error) {
            logger.error('Failed to create Gadget', error);
            throw new AppError(
                'Unable to create Gadget. Please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

export default GadgetService;
