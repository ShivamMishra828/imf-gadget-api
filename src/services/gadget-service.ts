import GadgetRepository from '../repositories/gadget-repository';
import { Gadget, GadgetStatus } from '@prisma/client';
import logger from '../config/logger-config';
import AppError from '../utils/app-error';
import { StatusCodes } from 'http-status-codes';
import { generateConfirmationCode, generateUniqueNames } from '../utils/helper';

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
                'An unexpected error occurred while creating the gadget.',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getAllGadgets(status?: GadgetStatus): Promise<Gadget[]> {
        try {
            const gadgets = await this.gadgetRepository.findAll(status);

            return gadgets.map((gadget) => ({
                ...gadget,
                missionSuccessProbability: `${gadget.codename} - ${Math.floor(Math.random() * 101)}% success probability`,
            }));
        } catch (error) {
            logger.error(`Failed to get gadgets list: ${status}`);
            throw new AppError(
                'An unexpected error occurred during gadget fetching',
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async updateGadget(id: string, updates: Partial<Gadget>): Promise<Gadget | null> {
        try {
            const updatedGadget = await this.gadgetRepository.update(id, updates);

            if (!updatedGadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            return updatedGadget;
        } catch (error) {
            if (error instanceof AppError) {
                logger.warn(`Error updating gadget with ID ${id}: ${error.message}`);
                throw error;
            } else {
                logger.error(`Error updating gadget: ${error}`);
                throw new AppError(
                    'An unexpected error occurred while updating the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async decommissionGadget(id: string): Promise<Gadget | null> {
        try {
            const gadget = await this.gadgetRepository.findById(id);
            if (!gadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            if (gadget.status === 'Decommissioned') {
                throw new AppError('Gadget is already decommissioned', StatusCodes.BAD_REQUEST);
            }

            return await this.gadgetRepository.decommission(id);
        } catch (error) {
            if (error instanceof AppError) {
                logger.warn(`Error decommissioning gadget with ID ${id}: ${error.message}`);
                throw error;
            } else {
                logger.error(`Error decommissioning gadget: ${error}`);
                throw new AppError(
                    'An unexpected error occurred while decommissioning the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async triggerSelfDestruct(id: string) {
        try {
            const gadget = await this.gadgetRepository.findById(id);
            if (!gadget) {
                throw new AppError('Gadget not found', StatusCodes.NOT_FOUND);
            }

            if (gadget.status === 'Destroyed') {
                throw new AppError('Gadget is already destroyed', StatusCodes.BAD_REQUEST);
            }

            const confirmationCode: string = generateConfirmationCode();
            const destroyedGadget = await this.gadgetRepository.selfDestruct(id);

            return {
                ...destroyedGadget,
                confirmationCode,
            };
        } catch (error) {
            if (error instanceof AppError) {
                logger.warn(`Error self destructing gadget with ID ${id}: ${error.message}`);
                throw error;
            } else {
                logger.error(`Error self destructing gadget: ${error}`);
                throw new AppError(
                    'An unexpected error occurred while self destructing the gadget.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}

export default GadgetService;
